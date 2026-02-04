use async_trait::async_trait;
use thiserror::Error;

use super::types::{AIResponse, ChatMessage};

/// Error types for AI provider operations
#[derive(Debug, Error)]
pub enum AIError {
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),

    #[error("Provider not available: {0}")]
    ProviderUnavailable(String),

    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),

    #[error("API error: {0}")]
    ApiError(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}

/// Trait for AI provider implementations
#[async_trait]
pub trait AIProvider: Send + Sync {
    /// Generate a completion for the given messages
    async fn complete(&self, messages: Vec<ChatMessage>) -> Result<AIResponse, AIError>;

    /// Generate a completion with optional model override
    async fn complete_with_model(
        &self,
        messages: Vec<ChatMessage>,
        model: Option<String>,
    ) -> Result<AIResponse, AIError> {
        // Default implementation ignores model override
        self.complete(messages).await
    }

    /// Get the name of this provider
    fn name(&self) -> &str;

    /// Check if this provider is available and configured
    async fn is_available(&self) -> bool;
}
