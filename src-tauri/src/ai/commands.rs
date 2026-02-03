use tauri::State;
use tokio::sync::Mutex;

use super::manager::AIProviderManager;
use super::types::{AIResponse, ChatMessage};

/// Tauri command to generate AI completions
#[tauri::command]
pub async fn ai_complete(
    messages: Vec<ChatMessage>,
    state: State<'_, Mutex<AIProviderManager>>,
) -> Result<AIResponse, String> {
    let manager = state.lock().await;
    manager
        .complete(messages)
        .await
        .map_err(|e| e.to_string())
}

/// Tauri command to list available AI providers
#[tauri::command]
pub async fn list_ai_providers(state: State<'_, Mutex<AIProviderManager>>) -> Result<Vec<String>, String> {
    let manager = state.lock().await;
    Ok(manager.list_providers())
}

/// Tauri command to set the default AI provider
#[tauri::command]
pub async fn set_ai_provider(
    name: String,
    state: State<'_, Mutex<AIProviderManager>>,
) -> Result<(), String> {
    let mut manager = state.lock().await;
    manager
        .set_default_provider(name)
        .map_err(|e| e.to_string())
}

/// Tauri command to get the current default provider
#[tauri::command]
pub async fn get_ai_provider(state: State<'_, Mutex<AIProviderManager>>) -> Result<String, String> {
    let manager = state.lock().await;
    Ok(manager.get_default_provider().to_string())
}

/// Tauri command to check if a specific provider is available
#[tauri::command]
pub async fn check_ai_provider_availability(
    name: String,
    state: State<'_, Mutex<AIProviderManager>>,
) -> Result<bool, String> {
    let manager = state.lock().await;
    Ok(manager.is_provider_available(&name).await)
}
