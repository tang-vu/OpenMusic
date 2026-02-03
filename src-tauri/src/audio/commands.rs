// Tauri commands for audio playback

use super::controller::AudioController;
use super::types::{AudioCommand, PlaybackState};
use std::sync::Mutex;
use tauri::State;

#[tauri::command]
pub fn play_audio(path: String, state: State<Mutex<AudioController>>) -> Result<(), String> {
    let controller = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    controller.send_command(AudioCommand::Play(path))
}

#[tauri::command]
pub fn pause_audio(state: State<Mutex<AudioController>>) -> Result<(), String> {
    let controller = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    controller.send_command(AudioCommand::Pause)
}

#[tauri::command]
pub fn resume_audio(state: State<Mutex<AudioController>>) -> Result<(), String> {
    let controller = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    controller.send_command(AudioCommand::Resume)
}

#[tauri::command]
pub fn stop_audio(state: State<Mutex<AudioController>>) -> Result<(), String> {
    let controller = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    controller.send_command(AudioCommand::Stop)
}

#[tauri::command]
pub fn set_volume(volume: f32, state: State<Mutex<AudioController>>) -> Result<(), String> {
    let controller = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    controller.send_command(AudioCommand::SetVolume(volume))
}

#[tauri::command]
pub fn get_playback_state(state: State<Mutex<AudioController>>) -> Result<PlaybackState, String> {
    let controller = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    Ok(controller.get_state())
}
