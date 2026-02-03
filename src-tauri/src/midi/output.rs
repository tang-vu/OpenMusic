// MIDI output handling

use super::types::MidiPort;
use anyhow::{Context, Result};
use midir::{MidiOutput, MidiOutputConnection};

pub struct MidiOutputHandler {
    midi_out: MidiOutput,
}

impl MidiOutputHandler {
    /// Create a new MIDI output handler
    pub fn new() -> Result<Self> {
        let midi_out = MidiOutput::new("OpenMusic MIDI Output")
            .context("Failed to create MIDI output")?;

        Ok(Self { midi_out })
    }

    /// List available MIDI output ports
    pub fn list_ports(&self) -> Result<Vec<MidiPort>> {
        let ports = self.midi_out.ports();
        let mut result = Vec::new();

        for (index, port) in ports.iter().enumerate() {
            let name = self
                .midi_out
                .port_name(port)
                .unwrap_or_else(|_| format!("Unknown Port {}", index));

            result.push(MidiPort { index, name });
        }

        Ok(result)
    }

    /// Connect to a MIDI output port by index
    pub fn connect(mut self, port_index: usize) -> Result<MidiOutputConnection> {
        let ports = self.midi_out.ports();

        if port_index >= ports.len() {
            return Err(anyhow::anyhow!("Invalid port index: {}", port_index));
        }

        let port = &ports[port_index];
        let port_name = self
            .midi_out
            .port_name(port)
            .unwrap_or_else(|_| "Unknown".to_string());

        // Connect to the port
        let connection = self
            .midi_out
            .connect(port, &format!("OpenMusic-{}", port_name))
            .context("Failed to connect to MIDI output port")?;

        Ok(connection)
    }
}

impl Default for MidiOutputHandler {
    fn default() -> Self {
        Self::new().expect("Failed to create MIDI output handler")
    }
}
