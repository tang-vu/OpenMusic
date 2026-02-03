// Audio types and state definitions

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PlaybackState {
    Stopped,
    Playing,
    Paused,
}

#[derive(Debug, Clone)]
pub enum AudioCommand {
    Play(String),
    Pause,
    Resume,
    Stop,
    SetVolume(f32),
}

impl Default for PlaybackState {
    fn default() -> Self {
        PlaybackState::Stopped
    }
}
