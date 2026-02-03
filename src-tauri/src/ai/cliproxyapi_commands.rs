use tauri::State;
use std::sync::Arc;
use tokio::sync::Mutex;

use super::cliproxyapi_manager::CLIProxyAPIManager;

/// Tauri command to check if CLIProxyAPI is installed
#[tauri::command]
pub async fn cliproxyapi_is_installed(
    state: State<'_, Arc<Mutex<CLIProxyAPIManager>>>,
) -> Result<bool, String> {
    let manager = state.lock().await;
    Ok(manager.is_installed())
}

/// Tauri command to download/install CLIProxyAPI
#[tauri::command]
pub async fn cliproxyapi_download(
    state: State<'_, Arc<Mutex<CLIProxyAPIManager>>>,
) -> Result<String, String> {
    let manager = state.lock().await;
    manager.download().await
}

/// Tauri command to start CLIProxyAPI server
#[tauri::command]
pub async fn cliproxyapi_start(
    state: State<'_, Arc<Mutex<CLIProxyAPIManager>>>,
) -> Result<(), String> {
    let manager = state.lock().await;
    manager.start()
}

/// Tauri command to stop CLIProxyAPI server
#[tauri::command]
pub async fn cliproxyapi_stop(
    state: State<'_, Arc<Mutex<CLIProxyAPIManager>>>,
) -> Result<(), String> {
    let manager = state.lock().await;
    manager.stop()
}

/// Tauri command to check if CLIProxyAPI server is running
#[tauri::command]
pub async fn cliproxyapi_is_running(
    state: State<'_, Arc<Mutex<CLIProxyAPIManager>>>,
) -> Result<bool, String> {
    let manager = state.lock().await;
    Ok(manager.is_running())
}

/// Tauri command to get CLIProxyAPI server URL
#[tauri::command]
pub async fn cliproxyapi_get_url(
    state: State<'_, Arc<Mutex<CLIProxyAPIManager>>>,
) -> Result<String, String> {
    let manager = state.lock().await;
    Ok(manager.get_url())
}

/// Tauri command to get installed version
#[tauri::command]
pub async fn cliproxyapi_get_version(
    state: State<'_, Arc<Mutex<CLIProxyAPIManager>>>,
) -> Result<Option<String>, String> {
    let manager = state.lock().await;
    Ok(manager.get_installed_version())
}

/// Tauri command to check for updates (returns latest version if newer)
#[tauri::command]
pub async fn cliproxyapi_check_update(
    state: State<'_, Arc<Mutex<CLIProxyAPIManager>>>,
) -> Result<Option<String>, String> {
    let manager = state.lock().await;
    let (latest, _) = manager.get_latest_release().await?;

    if let Some(installed) = manager.get_installed_version() {
        if installed != latest {
            return Ok(Some(latest));
        }
    }
    Ok(None)
}
