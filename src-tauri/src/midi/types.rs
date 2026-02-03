// MIDI types and definitions

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MidiPort {
    pub index: usize,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MidiMessage {
    pub timestamp: u64,
    pub data: Vec<u8>,
}
