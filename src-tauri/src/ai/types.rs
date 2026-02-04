use serde::{Deserialize, Serialize};

/// Represents a single message in a chat conversation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    /// The role of the message sender (e.g., "user", "assistant", "system")
    pub role: String,
    /// The content of the message
    pub content: String,
}

/// Response from an AI provider after completion
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIResponse {
    /// The generated content from the AI
    pub content: String,
    /// Name of the provider that generated this response
    pub provider: String,
    /// Optional token count for the response
    pub tokens: Option<u32>,
}

/// Configuration for AI providers
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIConfig {
    /// The default provider to use ("cliproxyapi" or "openai")
    pub default_provider: String,
    /// Base URL for CLIProxyAPI server (default: http://localhost:8080)
    pub cliproxyapi_url: Option<String>,
    /// Model to use for CLIProxyAPI (e.g., "claude-sonnet-4", "gemini-2.0-flash")
    pub cliproxyapi_model: Option<String>,
    /// API key for OpenAI (fallback)
    pub openai_api_key: Option<String>,
    /// Model to use for OpenAI (default: gpt-4o-mini)
    pub openai_model: Option<String>,
}

impl Default for AIConfig {
    fn default() -> Self {
        Self {
            default_provider: "cliproxyapi".to_string(),
            cliproxyapi_url: Some("http://localhost:8080".to_string()),
            cliproxyapi_model: Some("gpt-5".to_string()),
            openai_api_key: None,
            openai_model: Some("gpt-4o-mini".to_string()),
        }
    }
}

/// Internal request structure for OpenAI-compatible API
#[derive(Debug, Serialize)]
pub(crate) struct ChatCompletionRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
}

/// Internal response structure for OpenAI-compatible API
#[derive(Debug, Deserialize)]
pub(crate) struct ChatCompletionResponse {
    pub choices: Vec<Choice>,
    #[serde(default)]
    pub usage: Option<Usage>,
}

#[derive(Debug, Deserialize)]
pub(crate) struct Choice {
    pub message: ChatMessage,
    #[serde(default)]
    pub finish_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub(crate) struct Usage {
    #[serde(default)]
    pub total_tokens: Option<u32>,
}
