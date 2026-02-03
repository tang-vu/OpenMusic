use async_trait::async_trait;
use reqwest::Client;

use super::provider::{AIError, AIProvider};
use super::types::{AIResponse, ChatCompletionRequest, ChatCompletionResponse, ChatMessage};

/// OpenAI AI provider
pub struct OpenAIProvider {
    client: Client,
    base_url: String,
    model: String,
    api_key: String,
}

impl OpenAIProvider {
    /// Create a new OpenAI provider
    pub fn new(api_key: String, model: Option<String>) -> Result<Self, AIError> {
        if api_key.is_empty() {
            return Err(AIError::InvalidConfig(
                "OpenAI API key is required".to_string(),
            ));
        }

        Ok(Self {
            client: Client::new(),
            base_url: "https://api.openai.com/v1".to_string(),
            model: model.unwrap_or_else(|| "gpt-4o-mini".to_string()),
            api_key,
        })
    }

    /// Get the full endpoint URL for chat completions
    fn endpoint_url(&self) -> String {
        format!("{}/chat/completions", self.base_url.trim_end_matches('/'))
    }
}

#[async_trait]
impl AIProvider for OpenAIProvider {
    async fn complete(&self, messages: Vec<ChatMessage>) -> Result<AIResponse, AIError> {
        let request = ChatCompletionRequest {
            model: self.model.clone(),
            messages,
            temperature: Some(0.7),
            max_tokens: Some(1000),
        };

        let response = self
            .client
            .post(&self.endpoint_url())
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(AIError::ApiError(format!(
                "OpenAI API error ({}): {}",
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
            provider: "openai".to_string(),
            tokens: completion.usage.and_then(|u| u.total_tokens),
        })
    }

    fn name(&self) -> &str {
        "openai"
    }

    async fn is_available(&self) -> bool {
        // OpenAI is considered available if we have an API key
        // We don't ping the API to avoid unnecessary charges
        !self.api_key.is_empty()
    }
}
