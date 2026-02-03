use std::io::{Cursor, Read};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use tokio::fs;
use reqwest::Client;
use serde::Deserialize;

/// GitHub release asset info
#[derive(Debug, Deserialize)]
struct GitHubRelease {
    tag_name: String,
    assets: Vec<GitHubAsset>,
}

#[derive(Debug, Deserialize)]
struct GitHubAsset {
    name: String,
    browser_download_url: String,
}

/// CLIProxyAPI process manager - handles download, spawn, and lifecycle
pub struct CLIProxyAPIManager {
    process: Mutex<Option<Child>>,
    binary_path: PathBuf,
    config_path: PathBuf,
    port: u16,
}

impl CLIProxyAPIManager {
    /// Create a new CLIProxyAPI manager
    pub fn new(port: u16) -> Self {
        let data_dir = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("openmusic")
            .join("cliproxyapi");

        Self {
            process: Mutex::new(None),
            binary_path: data_dir.join(Self::binary_name()),
            config_path: data_dir.join("config.yaml"),
            port,
        }
    }

    /// Get platform-specific binary name
    fn binary_name() -> &'static str {
        #[cfg(target_os = "windows")]
        { "cliproxyapi.exe" }
        #[cfg(target_os = "macos")]
        { "cliproxyapi-darwin" }
        #[cfg(target_os = "linux")]
        { "cliproxyapi-linux" }
    }

    /// Get platform-specific asset pattern for GitHub releases
    fn asset_pattern() -> &'static str {
        #[cfg(all(target_os = "windows", target_arch = "x86_64"))]
        { "windows_amd64.zip" }
        #[cfg(all(target_os = "windows", target_arch = "aarch64"))]
        { "windows_arm64.zip" }
        #[cfg(all(target_os = "macos", target_arch = "x86_64"))]
        { "darwin_amd64.tar.gz" }
        #[cfg(all(target_os = "macos", target_arch = "aarch64"))]
        { "darwin_arm64.tar.gz" }
        #[cfg(all(target_os = "linux", target_arch = "x86_64"))]
        { "linux_amd64.tar.gz" }
        #[cfg(all(target_os = "linux", target_arch = "aarch64"))]
        { "linux_arm64.tar.gz" }
    }

    /// Check if CLIProxyAPI binary is installed
    pub fn is_installed(&self) -> bool {
        self.binary_path.exists()
    }

    /// Get the server URL
    pub fn get_url(&self) -> String {
        format!("http://localhost:{}", self.port)
    }

    /// Get latest release info from GitHub
    pub async fn get_latest_release(&self) -> Result<(String, String), String> {
        let client = Client::new();
        let url = "https://api.github.com/repos/router-for-me/CLIProxyAPI/releases/latest";

        let response = client
            .get(url)
            .header("User-Agent", "OpenMusic")
            .send()
            .await
            .map_err(|e| format!("Failed to fetch releases: {}", e))?;

        let release: GitHubRelease = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse release: {}", e))?;

        let pattern = Self::asset_pattern();
        let asset = release
            .assets
            .iter()
            .find(|a| a.name.contains(pattern) && !a.name.contains(".sha256"))
            .ok_or_else(|| format!("No binary found for platform: {}", pattern))?;

        Ok((release.tag_name, asset.browser_download_url.clone()))
    }

    /// Download CLIProxyAPI binary from GitHub releases
    pub async fn download(&self) -> Result<String, String> {
        let (version, download_url) = self.get_latest_release().await?;

        // Create directory
        let install_dir = self.binary_path.parent().unwrap();
        fs::create_dir_all(install_dir)
            .await
            .map_err(|e| format!("Failed to create directory: {}", e))?;

        // Download archive
        let client = Client::new();
        let response = client
            .get(&download_url)
            .header("User-Agent", "OpenMusic")
            .send()
            .await
            .map_err(|e| format!("Failed to download: {}", e))?;

        let bytes = response
            .bytes()
            .await
            .map_err(|e| format!("Failed to read bytes: {}", e))?;

        // Extract archive based on platform
        #[cfg(target_os = "windows")]
        {
            // Extract ZIP on Windows
            let cursor = Cursor::new(bytes.as_ref());
            let mut archive = zip::ZipArchive::new(cursor)
                .map_err(|e| format!("Failed to open zip: {}", e))?;

            for i in 0..archive.len() {
                let mut file = archive.by_index(i)
                    .map_err(|e| format!("Failed to read zip entry: {}", e))?;

                let name = file.name().to_string();
                if name.ends_with(".exe") {
                    let mut contents = Vec::new();
                    file.read_to_end(&mut contents)
                        .map_err(|e| format!("Failed to read exe: {}", e))?;
                    std::fs::write(&self.binary_path, contents)
                        .map_err(|e| format!("Failed to write binary: {}", e))?;
                    break;
                }
            }
        }

        #[cfg(unix)]
        {
            // Extract tar.gz on Unix
            use flate2::read::GzDecoder;
            use tar::Archive;

            let cursor = Cursor::new(bytes.as_ref());
            let gz = GzDecoder::new(cursor);
            let mut archive = Archive::new(gz);

            for entry in archive.entries().map_err(|e| format!("Failed to read tar: {}", e))? {
                let mut entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
                let path = entry.path().map_err(|e| format!("Failed to get path: {}", e))?;

                if let Some(name) = path.file_name() {
                    if name == "CLIProxyAPI" {
                        entry.unpack(&self.binary_path)
                            .map_err(|e| format!("Failed to extract: {}", e))?;
                        break;
                    }
                }
            }

            // Make executable
            use std::os::unix::fs::PermissionsExt;
            let mut perms = std::fs::metadata(&self.binary_path)
                .map_err(|e| format!("Failed to get metadata: {}", e))?
                .permissions();
            perms.set_mode(0o755);
            std::fs::set_permissions(&self.binary_path, perms)
                .map_err(|e| format!("Failed to set permissions: {}", e))?;
        }

        // Create default config if not exists
        if !self.config_path.exists() {
            self.create_default_config().await?;
        }

        Ok(version)
    }

    /// Create default config.yaml
    async fn create_default_config(&self) -> Result<(), String> {
        let config = format!(
            r#"# CLIProxyAPI Configuration for OpenMusic
host: 127.0.0.1
port: {}
log-level: info
auth-dir: ~/.openmusic-cliproxyapi

# Add your OAuth accounts in auth-dir
# See: https://help.router-for.me/
"#,
            self.port
        );

        fs::write(&self.config_path, config)
            .await
            .map_err(|e| format!("Failed to write config: {}", e))?;

        // Create auth-dir in user home
        if let Some(home) = dirs::home_dir() {
            let auth_dir = home.join(".openmusic-cliproxyapi");
            fs::create_dir_all(&auth_dir)
                .await
                .map_err(|e| format!("Failed to create auth dir: {}", e))?;
        }

        Ok(())
    }

    /// Start CLIProxyAPI server
    pub fn start(&self) -> Result<(), String> {
        if !self.is_installed() {
            return Err("CLIProxyAPI not installed. Call download() first.".to_string());
        }

        let mut process_guard = self.process.lock().unwrap();

        // Check if already running
        if let Some(ref mut child) = *process_guard {
            match child.try_wait() {
                Ok(Some(_)) => {} // Process exited, we can start new one
                Ok(None) => return Ok(()), // Already running
                Err(_) => {}
            }
        }

        let child = Command::new(&self.binary_path)
            .current_dir(self.binary_path.parent().unwrap())
            .arg("--config")
            .arg(&self.config_path)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("Failed to start CLIProxyAPI: {}", e))?;

        *process_guard = Some(child);
        Ok(())
    }

    /// Stop CLIProxyAPI server
    pub fn stop(&self) -> Result<(), String> {
        // First try to kill via process handle if we have one
        {
            let mut process_guard = self.process.lock().unwrap();
            if let Some(ref mut child) = *process_guard {
                let _ = child.kill();
                let _ = child.wait();
                *process_guard = None;
            }
        }

        // Also kill any orphan process by name (handles app restart case)
        #[cfg(target_os = "windows")]
        {
            let _ = Command::new("taskkill")
                .args(["/F", "/IM", "cliproxyapi.exe"])
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .status();
        }

        #[cfg(unix)]
        {
            let _ = Command::new("pkill")
                .arg("-f")
                .arg("cliproxyapi")
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .status();
        }

        Ok(())
    }

    /// Check if server is running by checking if port is responding
    pub fn is_running(&self) -> bool {
        // Check via TCP connection (more reliable than process handle)
        std::net::TcpStream::connect_timeout(
            &format!("127.0.0.1:{}", self.port).parse().unwrap(),
            std::time::Duration::from_millis(500),
        ).is_ok()
    }

    /// Get installed version (reads from binary --version)
    pub fn get_installed_version(&self) -> Option<String> {
        if !self.is_installed() {
            return None;
        }

        Command::new(&self.binary_path)
            .arg("--version")
            .output()
            .ok()
            .and_then(|o| String::from_utf8(o.stdout).ok())
            .map(|s| s.trim().to_string())
    }
}

impl Drop for CLIProxyAPIManager {
    fn drop(&mut self) {
        let _ = self.stop();
    }
}
