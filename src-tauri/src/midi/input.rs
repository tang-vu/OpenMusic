// MIDI input handling

use super::types::{MidiMessage, MidiPort};
use anyhow::{Context, Result};
use midir::{MidiInput, MidiInputConnection};
use std::sync::mpsc::{channel, Receiver};

pub struct MidiInputHandler {
    midi_in: MidiInput,
}

impl MidiInputHandler {
    /// Create a new MIDI input handler
    pub fn new() -> Result<Self> {
        let midi_in = MidiInput::new("OpenMusic MIDI Input")
            .context("Failed to create MIDI input")?;

        Ok(Self { midi_in })
    }

    /// List available MIDI input ports
    pub fn list_ports(&self) -> Result<Vec<MidiPort>> {
        let ports = self.midi_in.ports();
        let mut result = Vec::new();

        for (index, port) in ports.iter().enumerate() {
            let name = self
                .midi_in
                .port_name(port)
                .unwrap_or_else(|_| format!("Unknown Port {}", index));

            result.push(MidiPort { index, name });
        }

        Ok(result)
    }

    /// Connect to a MIDI input port by index
    pub fn connect(
        mut self,
        port_index: usize,
    ) -> Result<(MidiInputConnection<()>, Receiver<MidiMessage>)> {
        let ports = self.midi_in.ports();

        if port_index >= ports.len() {
            return Err(anyhow::anyhow!("Invalid port index: {}", port_index));
        }

        let port = &ports[port_index];
        let port_name = self
            .midi_in
            .port_name(port)
            .unwrap_or_else(|_| "Unknown".to_string());

        let (tx, rx) = channel::<MidiMessage>();

        // Connect to the port
        let connection = self
            .midi_in
            .connect(
                port,
                &format!("OpenMusic-{}", port_name),
                move |timestamp, data, _| {
                    let message = MidiMessage {
                        timestamp,
                        data: data.to_vec(),
                    };
                    let _ = tx.send(message);
                },
                (),
            )
            .context("Failed to connect to MIDI port")?;

        Ok((connection, rx))
    }
}

impl Default for MidiInputHandler {
    fn default() -> Self {
        Self::new().expect("Failed to create MIDI input handler")
    }
}
