// Audio controller with thread-safe communication

use super::engine::AudioEngine;
use super::types::{AudioCommand, PlaybackState};
use std::sync::mpsc::{channel, Sender};
use std::sync::{Arc, Mutex};
use std::thread;

pub struct AudioController {
    command_tx: Sender<AudioCommand>,
    state: Arc<Mutex<PlaybackState>>,
}

impl AudioController {
    /// Spawn a new audio controller with dedicated thread
    pub fn spawn() -> Self {
        let (command_tx, command_rx) = channel::<AudioCommand>();
        let state = Arc::new(Mutex::new(PlaybackState::Stopped));
        let state_clone = Arc::clone(&state);

        // Spawn audio engine thread
        thread::spawn(move || {
            let engine = match AudioEngine::new() {
                Ok(engine) => engine,
                Err(e) => {
                    eprintln!("Failed to create audio engine: {}", e);
                    return;
                }
            };

            // Process commands
            while let Ok(command) = command_rx.recv() {
                match command {
                    AudioCommand::Play(path) => {
                        if let Err(e) = engine.play_file(&path) {
                            eprintln!("Failed to play audio file: {}", e);
                            *state_clone.lock().unwrap() = PlaybackState::Stopped;
                        } else {
                            *state_clone.lock().unwrap() = PlaybackState::Playing;
                        }
                    }
                    AudioCommand::Pause => {
                        engine.pause();
                        *state_clone.lock().unwrap() = PlaybackState::Paused;
                    }
                    AudioCommand::Resume => {
                        engine.resume();
                        *state_clone.lock().unwrap() = PlaybackState::Playing;
                    }
                    AudioCommand::Stop => {
                        engine.stop();
                        *state_clone.lock().unwrap() = PlaybackState::Stopped;
                    }
                    AudioCommand::SetVolume(vol) => {
                        engine.set_volume(vol);
                    }
                }
            }
        });

        Self { command_tx, state }
    }

    /// Send a command to the audio engine
    pub fn send_command(&self, command: AudioCommand) -> Result<(), String> {
        self.command_tx
            .send(command)
            .map_err(|e| format!("Failed to send command: {}", e))
    }

    /// Get current playback state
    pub fn get_state(&self) -> PlaybackState {
        self.state.lock().unwrap().clone()
    }
}
