use super::cliproxyapi::CLIProxyAPIProvider;
use super::openai::OpenAIProvider;
use super::provider::{AIError, AIProvider};
use super::types::{AIConfig, AIResponse, ChatMessage};

/// Manager for multiple AI providers with automatic routing
pub struct AIProviderManager {
    providers: Vec<Box<dyn AIProvider>>,
    default_provider: String,
}

impl AIProviderManager {
    /// Create a new AI provider manager with the given configuration
    pub fn new(config: AIConfig) -> Self {
        let mut providers: Vec<Box<dyn AIProvider>> = Vec::new();

        // Add CLIProxyAPI provider (primary - uses Claude/Gemini/Codex via OAuth)
        let cliproxyapi = CLIProxyAPIProvider::new(config.cliproxyapi_url, config.cliproxyapi_model);
        providers.push(Box::new(cliproxyapi));

        // Add OpenAI provider if API key is provided (fallback)
        if let Some(api_key) = config.openai_api_key {
            if !api_key.is_empty() {
                if let Ok(openai) = OpenAIProvider::new(api_key, config.openai_model) {
                    providers.push(Box::new(openai));
                }
            }
        }

        Self {
            providers,
            default_provider: config.default_provider,
        }
    }

    /// Generate a completion with auto-fallback to other providers on failure
    ///
    /// Tries providers in order: default first, then others by availability.
    /// Returns the first successful response or the last error if all fail.
    pub async fn complete(&self, messages: Vec<ChatMessage>) -> Result<AIResponse, AIError> {
        // Build provider order: default first, then others
        let mut provider_order: Vec<&Box<dyn AIProvider>> = Vec::new();

        // Add default provider first if it exists
        if let Some(default) = self.providers.iter().find(|p| p.name() == self.default_provider) {
            provider_order.push(default);
        }

        // Add remaining providers
        for provider in &self.providers {
            if provider.name() != self.default_provider {
                provider_order.push(provider);
            }
        }

        if provider_order.is_empty() {
            return Err(AIError::ProviderUnavailable("No providers configured".to_string()));
        }

        let mut last_error: Option<AIError> = None;
        let mut tried_providers: Vec<String> = Vec::new();

        // Try each provider with auto-fallback
        for provider in provider_order {
            let provider_name = provider.name().to_string();

            // Check availability first
            if !provider.is_available().await {
                tried_providers.push(format!("{} (unavailable)", provider_name));
                continue;
            }

            // Attempt completion
            match provider.complete(messages.clone()).await {
                Ok(response) => {
                    // Log fallback if we didn't use default
                    if !tried_providers.is_empty() {
                        eprintln!(
                            "[AI] Fallback success: {} (tried: {})",
                            provider_name,
                            tried_providers.join(" → ")
                        );
                    }
                    return Ok(response);
                }
                Err(e) => {
                    tried_providers.push(format!("{} ({})", provider_name, e));
                    last_error = Some(e);
                }
            }
        }

        // All providers failed
        Err(last_error.unwrap_or_else(|| {
            AIError::ProviderUnavailable(format!(
                "All providers failed: {}",
                tried_providers.join(" → ")
            ))
        }))
    }

    /// List all available provider names
    pub fn list_providers(&self) -> Vec<String> {
        self.providers.iter().map(|p| p.name().to_string()).collect()
    }

    /// Set the default provider by name
    pub fn set_default_provider(&mut self, name: String) -> Result<(), AIError> {
        if !self.providers.iter().any(|p| p.name() == name) {
            return Err(AIError::ProviderUnavailable(format!(
                "Provider '{}' not found",
                name
            )));
        }

        self.default_provider = name;
        Ok(())
    }

    /// Get the current default provider name
    pub fn get_default_provider(&self) -> &str {
        &self.default_provider
    }

    /// Check if a specific provider is available
    pub async fn is_provider_available(&self, name: &str) -> bool {
        if let Some(provider) = self.providers.iter().find(|p| p.name() == name) {
            provider.is_available().await
        } else {
            false
        }
    }
}
