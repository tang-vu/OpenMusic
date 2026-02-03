// Audio module for playback and synthesis
pub mod audio;

// MIDI module for parsing and generation
pub mod midi;

// AI module for provider integration
pub mod ai;

use ai::commands::{
    ai_complete, check_ai_provider_availability, get_ai_provider, list_ai_providers,
    set_ai_provider,
};
use ai::cliproxyapi_commands::{
    cliproxyapi_is_installed, cliproxyapi_download, cliproxyapi_start,
    cliproxyapi_stop, cliproxyapi_is_running, cliproxyapi_get_url,
    cliproxyapi_get_version, cliproxyapi_check_update,
};
use ai::CLIProxyAPIManager;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize AI provider manager with default configuration
    let ai_config = ai::AIConfig::default();
    let ai_manager = ai::AIProviderManager::new(ai_config);

    // Initialize CLIProxyAPI manager (port 8080)
    let cliproxyapi_manager = Arc::new(Mutex::new(CLIProxyAPIManager::new(8080)));
    let cliproxyapi_for_cleanup = cliproxyapi_manager.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(Mutex::new(ai_manager))
        .manage(Mutex::new(audio::AudioController::spawn()))
        .manage(cliproxyapi_manager)
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .on_window_event(move |_window, event| {
            // Kill CLIProxyAPI when app window is destroyed
            if let tauri::WindowEvent::Destroyed = event {
                let manager = cliproxyapi_for_cleanup.clone();
                std::thread::spawn(move || {
                    if let Ok(m) = manager.try_lock() {
                        let _ = m.stop();
                    }
                });
            }
        })
        .invoke_handler(tauri::generate_handler![
            // Audio commands
            audio::play_audio,
            audio::pause_audio,
            audio::resume_audio,
            audio::stop_audio,
            audio::set_volume,
            audio::get_playback_state,
            // MIDI commands
            midi::list_midi_input_ports,
            midi::list_midi_output_ports,
            midi::connect_midi_input,
            midi::connect_midi_output,
            // AI commands
            ai_complete,
            list_ai_providers,
            set_ai_provider,
            get_ai_provider,
            check_ai_provider_availability,
            // CLIProxyAPI manager commands
            cliproxyapi_is_installed,
            cliproxyapi_download,
            cliproxyapi_start,
            cliproxyapi_stop,
            cliproxyapi_is_running,
            cliproxyapi_get_url,
            cliproxyapi_get_version,
            cliproxyapi_check_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
