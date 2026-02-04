use async_trait::async_trait;
use reqwest::Client;
use std::time::Duration;

use super::provider::{AIError, AIProvider};
use super::types::{AIResponse, ChatCompletionRequest, ChatCompletionResponse, ChatMessage};

/// CLIProxyAPI provider - connects to external CLIProxyAPI server
/// User runs CLIProxyAPI separately and updates it independently
/// Server provides access to Claude Code, Gemini CLI, Codex CLI via OAuth subscriptions
pub struct CLIProxyAPIProvider {
    client: Client,
    base_url: String,
    model: String,
}

impl CLIProxyAPIProvider {
    /// Create a new CLIProxyAPI provider
    ///
    /// # Arguments
    /// * `base_url` - CLIProxyAPI server URL (default: http://localhost:8080)
    /// * `model` - Model to use (e.g., "claude-sonnet-4", "gemini-2.0-flash", "gpt-4o")
    pub fn new(base_url: Option<String>, model: Option<String>) -> Self {
        Self {
            client: Client::builder()
                .timeout(Duration::from_secs(120))
                .build()
                .unwrap_or_else(|_| Client::new()),
            base_url: base_url.unwrap_or_else(|| {
                std::env::var("CLIPROXYAPI_URL")
                    .unwrap_or_else(|_| "http://localhost:8080".to_string())
            }),
            model: model.unwrap_or_else(|| {
                std::env::var("CLIPROXYAPI_MODEL")
                    .unwrap_or_else(|_| "claude-sonnet-4".to_string())
            }),
        }
    }

    /// Get the OpenAI-compatible chat completions endpoint
    fn endpoint_url(&self) -> String {
        format!("{}/v1/chat/completions", self.base_url.trim_end_matches('/'))
    }
}

#[async_trait]
impl AIProvider for CLIProxyAPIProvider {
    async fn complete(&self, messages: Vec<ChatMessage>) -> Result<AIResponse, AIError> {
        self.complete_with_model(messages, None).await
    }

    async fn complete_with_model(
        &self,
        messages: Vec<ChatMessage>,
        model: Option<String>,
    ) -> Result<AIResponse, AIError> {
        let model_to_use = model.unwrap_or_else(|| self.model.clone());

        let request = ChatCompletionRequest {
            model: model_to_use.clone(),
            messages,
            temperature: Some(0.7),
            max_tokens: Some(4096),
        };

        let response = self
            .client
            .post(&self.endpoint_url())
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(AIError::ApiError(format!(
                "CLIProxyAPI error ({}): {}",
                status, error_text
            )));
        }

        let completion: ChatCompletionResponse = response.json().await?;

        let choice = completion
            .choices
            .first()
            .ok_or_else(|| AIError::ApiError("No choices in response".to_string()))?;

        Ok(AIResponse {
            content: choice.message.content.clone(),
            provider: format!("cliproxyapi:{}", model_to_use),
            tokens: completion.usage.and_then(|u| u.total_tokens),
        })
    }

    fn name(&self) -> &str {
        "cliproxyapi"
    }

    async fn is_available(&self) -> bool {
        // Check if CLIProxyAPI server is reachable via models endpoint (OpenAI-compatible)
        let models_url = format!("{}/v1/models", self.base_url.trim_end_matches('/'));

        self.client
            .get(&models_url)
            .timeout(Duration::from_secs(3))
            .send()
            .await
            .map(|r| r.status().is_success())
            .unwrap_or(false)
    }
}
