use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

use super::provider::{AIError, AIProvider};
use super::types::{AIResponse, ChatMessage};

/// Claude Code credentials from ~/.claude/.credentials.json
#[derive(Debug, Deserialize)]
struct ClaudeCredentials {
    #[serde(rename = "claudeAiOauth")]
    claude_ai_oauth: Option<OAuthTokens>,
}

#[derive(Debug, Deserialize, Clone)]
struct OAuthTokens {
    #[serde(rename = "accessToken")]
    access_token: String,
    #[serde(rename = "refreshToken")]
    refresh_token: String,
    #[serde(rename = "expiresAt")]
    expires_at: i64,
}

/// Request body for Claude API
#[derive(Debug, Serialize)]
struct ClaudeRequest {
    model: String,
    max_tokens: u32,
    messages: Vec<ClaudeMessage>,
}

#[derive(Debug, Serialize)]
struct ClaudeMessage {
    role: String,
    content: String,
}

/// Response from Claude API
#[derive(Debug, Deserialize)]
struct ClaudeResponse {
    content: Vec<ContentBlock>,
    usage: Option<ClaudeUsage>,
}

#[derive(Debug, Deserialize)]
struct ContentBlock {
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ClaudeUsage {
    input_tokens: Option<u32>,
    output_tokens: Option<u32>,
}

/// Claude Code provider using OAuth tokens from CLI subscription
pub struct ClaudeCodeProvider {
    client: Client,
    model: String,
    credentials_path: PathBuf,
}

impl ClaudeCodeProvider {
    /// Create a new Claude Code provider
    /// Reads OAuth tokens from ~/.claude/.credentials.json
    pub fn new(model: Option<String>) -> Self {
        let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
        let credentials_path = home.join(".claude").join(".credentials.json");

        Self {
            client: Client::new(),
            model: model.unwrap_or_else(|| "claude-sonnet-4-20250514".to_string()),
            credentials_path,
        }
    }

    /// Load OAuth tokens from credentials file
    fn load_credentials(&self) -> Result<OAuthTokens, AIError> {
        if !self.credentials_path.exists() {
            return Err(AIError::InvalidConfig(
                "Claude Code not logged in. Run 'claude' CLI and login first.".to_string(),
            ));
        }

        let content = std::fs::read_to_string(&self.credentials_path)
            .map_err(|e| AIError::InvalidConfig(format!("Failed to read credentials: {}", e)))?;

        let creds: ClaudeCredentials = serde_json::from_str(&content)
            .map_err(|e| AIError::InvalidConfig(format!("Invalid credentials format: {}", e)))?;

        creds.claude_ai_oauth.ok_or_else(|| {
            AIError::InvalidConfig("No OAuth tokens found. Please login to Claude Code.".to_string())
        })
    }

    /// Check if token is expired
    fn is_token_expired(&self, tokens: &OAuthTokens) -> bool {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs() as i64)
            .unwrap_or(0);

        // Consider expired if less than 5 minutes remaining
        tokens.expires_at < (now + 300)
    }
}

#[async_trait]
impl AIProvider for ClaudeCodeProvider {
    async fn complete(&self, messages: Vec<ChatMessage>) -> Result<AIResponse, AIError> {
        let tokens = self.load_credentials()?;

        if self.is_token_expired(&tokens) {
            return Err(AIError::InvalidConfig(
                "Claude Code token expired. Please re-login with 'claude' CLI.".to_string(),
            ));
        }

        // Convert messages to Claude format
        let claude_messages: Vec<ClaudeMessage> = messages
            .into_iter()
            .map(|m| ClaudeMessage {
                role: if m.role == "user" { "user".to_string() } else { "assistant".to_string() },
                content: m.content,
            })
            .collect();

        let request = ClaudeRequest {
            model: self.model.clone(),
            max_tokens: 4096,
            messages: claude_messages,
        };

        let response = self
            .client
            .post("https://api.anthropic.com/v1/messages")
            .header("x-api-key", &tokens.access_token)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(AIError::ApiError(format!(
                "Claude API error ({}): {}",
                status, error_text
            )));
        }

        let completion: ClaudeResponse = response.json().await?;

        let content = completion
            .content
            .first()
            .and_then(|c| c.text.clone())
            .unwrap_or_default();

        let tokens_used = completion.usage.map(|u| {
            u.input_tokens.unwrap_or(0) + u.output_tokens.unwrap_or(0)
        });

        Ok(AIResponse {
            content,
            provider: "claude-code".to_string(),
            tokens: tokens_used,
        })
    }

    fn name(&self) -> &str {
        "claude-code"
    }

    async fn is_available(&self) -> bool {
        match self.load_credentials() {
            Ok(tokens) => !self.is_token_expired(&tokens),
            Err(_) => false,
        }
    }
}
