// Audio engine implementation using rodio

use anyhow::{Context, Result};
use rodio::{Decoder, OutputStream, Sink};
use std::fs::File;
use std::io::BufReader;

pub struct AudioEngine {
    _stream: OutputStream,
    sink: Sink,
}

impl AudioEngine {
    /// Create a new audio engine instance
    pub fn new() -> Result<Self> {
        let (stream, stream_handle) = OutputStream::try_default()
            .context("Failed to create audio output stream")?;

        let sink = Sink::try_new(&stream_handle)
            .context("Failed to create audio sink")?;

        Ok(Self {
            _stream: stream,
            sink,
        })
    }

    /// Play an audio file from the given path
    pub fn play_file(&self, path: &str) -> Result<()> {
        // Stop current playback
        self.sink.stop();

        // Open the audio file
        let file = File::open(path)
            .context(format!("Failed to open audio file: {}", path))?;

        let source = Decoder::new(BufReader::new(file))
            .context("Failed to decode audio file")?;

        // Add to sink and play
        self.sink.append(source);
        self.sink.play();

        Ok(())
    }

    /// Pause playback
    pub fn pause(&self) {
        self.sink.pause();
    }

    /// Resume playback
    pub fn resume(&self) {
        self.sink.play();
    }

    /// Stop playback completely
    pub fn stop(&self) {
        self.sink.stop();
    }

    /// Set volume (0.0 to 1.0)
    pub fn set_volume(&self, vol: f32) {
        let clamped_vol = vol.clamp(0.0, 1.0);
        self.sink.set_volume(clamped_vol);
    }

    /// Get current playback state
    pub fn is_paused(&self) -> bool {
        self.sink.is_paused()
    }

    /// Check if sink is empty (no audio queued)
    pub fn is_empty(&self) -> bool {
        self.sink.empty()
    }
}

impl Default for AudioEngine {
    fn default() -> Self {
        Self::new().expect("Failed to create default audio engine")
    }
}
