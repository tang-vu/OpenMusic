use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

use super::provider::{AIError, AIProvider};
use super::types::{AIResponse, ChatMessage};

/// Gemini CLI cached credentials
#[derive(Debug, Deserialize)]
struct GeminiCredentials {
    access_token: Option<String>,
    refresh_token: Option<String>,
    expiry: Option<String>,
}

/// Request body for Gemini API
#[derive(Debug, Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiContent>,
    #[serde(rename = "generationConfig")]
    generation_config: Option<GenerationConfig>,
}

#[derive(Debug, Serialize)]
struct GeminiContent {
    role: String,
    parts: Vec<GeminiPart>,
}

#[derive(Debug, Serialize)]
struct GeminiPart {
    text: String,
}

#[derive(Debug, Serialize)]
struct GenerationConfig {
    #[serde(rename = "maxOutputTokens")]
    max_output_tokens: u32,
    temperature: f32,
}

/// Response from Gemini API
#[derive(Debug, Deserialize)]
struct GeminiResponse {
    candidates: Option<Vec<GeminiCandidate>>,
    #[serde(rename = "usageMetadata")]
    usage_metadata: Option<UsageMetadata>,
}

#[derive(Debug, Deserialize)]
struct GeminiCandidate {
    content: Option<GeminiContentResponse>,
}

#[derive(Debug, Deserialize)]
struct GeminiContentResponse {
    parts: Option<Vec<GeminiPartResponse>>,
}

#[derive(Debug, Deserialize)]
struct GeminiPartResponse {
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct UsageMetadata {
    #[serde(rename = "totalTokenCount")]
    total_token_count: Option<u32>,
}

/// Gemini CLI provider using OAuth tokens or API key
pub struct GeminiCLIProvider {
    client: Client,
    model: String,
    api_key: Option<String>,
}

impl GeminiCLIProvider {
    /// Create a new Gemini CLI provider
    /// Tries to use GEMINI_API_KEY env var, or falls back to cached OAuth
    pub fn new(api_key: Option<String>, model: Option<String>) -> Self {
        let api_key = api_key.or_else(|| std::env::var("GEMINI_API_KEY").ok());

        Self {
            client: Client::new(),
            model: model.unwrap_or_else(|| "gemini-2.0-flash".to_string()),
            api_key,
        }
    }

    /// Try to load OAuth tokens from Gemini CLI cache
    fn load_oauth_tokens(&self) -> Option<String> {
        // Gemini CLI stores tokens in application-specific location
        let home = dirs::home_dir()?;

        // Try common locations
        let possible_paths = vec![
            home.join(".config").join("gemini-cli").join("credentials.json"),
            home.join(".gemini").join("credentials.json"),
            home.join("AppData").join("Local").join("gemini-cli").join("credentials.json"),
        ];

        for path in possible_paths {
            if path.exists() {
                if let Ok(content) = std::fs::read_to_string(&path) {
                    if let Ok(creds) = serde_json::from_str::<GeminiCredentials>(&content) {
                        return creds.access_token;
                    }
                }
            }
        }
        None
    }

    fn get_endpoint(&self) -> String {
        format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent",
            self.model
        )
    }
}

#[async_trait]
impl AIProvider for GeminiCLIProvider {
    async fn complete(&self, messages: Vec<ChatMessage>) -> Result<AIResponse, AIError> {
        // Try API key first, then OAuth
        let auth = self.api_key.clone()
            .or_else(|| self.load_oauth_tokens())
            .ok_or_else(|| AIError::InvalidConfig(
                "No Gemini API key or OAuth tokens. Set GEMINI_API_KEY or login via 'gemini' CLI.".to_string()
            ))?;

        // Convert messages to Gemini format
        let contents: Vec<GeminiContent> = messages
            .into_iter()
            .map(|m| GeminiContent {
                role: if m.role == "user" { "user".to_string() } else { "model".to_string() },
                parts: vec![GeminiPart { text: m.content }],
            })
            .collect();

        let request = GeminiRequest {
            contents,
            generation_config: Some(GenerationConfig {
                max_output_tokens: 4096,
                temperature: 0.7,
            }),
        };

        let url = format!("{}?key={}", self.get_endpoint(), auth);

        let response = self
            .client
            .post(&url)
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(AIError::ApiError(format!(
                "Gemini API error ({}): {}",
                status, error_text
            )));
        }

        let completion: GeminiResponse = response.json().await?;

        let content = completion
            .candidates
            .and_then(|c| c.first().cloned())
            .and_then(|c| c.content)
            .and_then(|c| c.parts)
            .and_then(|p| p.first().cloned())
            .and_then(|p| p.text)
            .unwrap_or_default();

        let tokens_used = completion.usage_metadata.and_then(|u| u.total_token_count);

        Ok(AIResponse {
            content,
            provider: "gemini".to_string(),
            tokens: tokens_used,
        })
    }

    fn name(&self) -> &str {
        "gemini"
    }

    async fn is_available(&self) -> bool {
        self.api_key.is_some() || self.load_oauth_tokens().is_some()
    }
}
