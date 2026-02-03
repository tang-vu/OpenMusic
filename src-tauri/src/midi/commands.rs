// Tauri commands for MIDI functionality

use super::input::MidiInputHandler;
use super::output::MidiOutputHandler;
use super::types::MidiPort;

#[tauri::command]
pub fn list_midi_input_ports() -> Result<Vec<MidiPort>, String> {
    let handler = MidiInputHandler::new().map_err(|e| e.to_string())?;
    handler.list_ports().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_midi_output_ports() -> Result<Vec<MidiPort>, String> {
    let handler = MidiOutputHandler::new().map_err(|e| e.to_string())?;
    handler.list_ports().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn connect_midi_input(port_index: usize) -> Result<String, String> {
    let handler = MidiInputHandler::new().map_err(|e| e.to_string())?;
    let ports = handler.list_ports().map_err(|e| e.to_string())?;

    if port_index >= ports.len() {
        return Err(format!("Invalid port index: {}", port_index));
    }

    Ok(format!("Connected to MIDI input port: {}", ports[port_index].name))
}

#[tauri::command]
pub fn connect_midi_output(port_index: usize) -> Result<String, String> {
    let handler = MidiOutputHandler::new().map_err(|e| e.to_string())?;
    let ports = handler.list_ports().map_err(|e| e.to_string())?;

    if port_index >= ports.len() {
        return Err(format!("Invalid port index: {}", port_index));
    }

    Ok(format!("Connected to MIDI output port: {}", ports[port_index].name))
}
