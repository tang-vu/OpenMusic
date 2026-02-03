// Audio playback and synthesis module

pub mod commands;
pub mod controller;
pub mod engine;
pub mod types;

// Re-export commonly used items
pub use commands::*;
pub use controller::AudioController;
pub use engine::AudioEngine;
pub use types::{AudioCommand, PlaybackState};
