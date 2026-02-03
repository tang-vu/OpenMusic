// AI provider types and configuration
pub mod types;

// AI provider trait and error types
pub mod provider;

// AI provider implementations
pub mod cliproxyapi;  // CLIProxyAPI - external server (Claude/Gemini/Codex via OAuth)
pub mod openai;       // OpenAI API - fallback option

// CLIProxyAPI binary manager (download, spawn, lifecycle)
pub mod cliproxyapi_manager;
pub mod cliproxyapi_commands;

// AI provider manager
pub mod manager;

// Tauri commands for AI operations
pub mod commands;

// Re-export commonly used types and functions
pub use commands::{
    ai_complete,
    check_ai_provider_availability,
    get_ai_provider,
    list_ai_providers,
    set_ai_provider
};
pub use cliproxyapi_commands::*;
pub use cliproxyapi_manager::CLIProxyAPIManager;
pub use manager::AIProviderManager;
pub use types::{AIConfig, AIResponse, ChatMessage};
