import { useState, useEffect } from 'react';
import { cliproxyApi, cliproxyHttpApi, type CLIProxyModel, type CLIProxyAuthFile } from '@/lib/tauri-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function SettingsPanel() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [version, setVersion] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Provider data
  const [models, setModels] = useState<CLIProxyModel[]>([]);
  const [authFiles, setAuthFiles] = useState<CLIProxyAuthFile[]>([]);
  const [oauthState, setOauthState] = useState<string | null>(null);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  // Load provider data when server is running
  useEffect(() => {
    if (isRunning) {
      loadProviderData();
    } else {
      setModels([]);
      setAuthFiles([]);
    }
  }, [isRunning]);

  // Poll OAuth status
  useEffect(() => {
    if (!oauthState) return;

    const interval = setInterval(async () => {
      try {
        const result = await cliproxyHttpApi.checkOAuthStatus(oauthState);
        if (result.status === 'ok') {
          setOauthState(null);
          setStatus('Account added successfully!');
          loadProviderData();
        } else if (result.status === 'error') {
          setOauthState(null);
          setError(result.error || 'OAuth failed');
        }
      } catch {
        // Keep polling
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [oauthState]);

  const loadProviderData = async () => {
    try {
      const [modelList, authList] = await Promise.all([
        cliproxyHttpApi.listModels().catch(() => []),
        cliproxyHttpApi.listAuthFiles().catch(() => []),
      ]);
      setModels(modelList);
      setAuthFiles(authList);
    } catch (e) {
      console.error('Failed to load provider data:', e);
    }
  };

  const checkStatus = async () => {
    try {
      const [installed, running, ver, url] = await Promise.all([
        cliproxyApi.isInstalled(),
        cliproxyApi.isRunning(),
        cliproxyApi.getVersion(),
        cliproxyApi.getUrl(),
      ]);
      setIsInstalled(installed);
      setIsRunning(running);
      setVersion(ver);
      setServerUrl(url);

      if (installed) {
        const update = await cliproxyApi.checkUpdate();
        setUpdateAvailable(update);
      }
    } catch (e) {
      console.error('Failed to check status:', e);
    }
  };

  const handleInstall = async () => {
    setIsLoading(true);
    setError(null);
    setStatus('Downloading CLIProxyAPI...');
    try {
      const ver = await cliproxyApi.download();
      setStatus(`Installed version ${ver}`);
      await checkStatus();
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await cliproxyApi.start();
      setStatus('CLIProxyAPI started');
      await checkStatus();
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await cliproxyApi.stop();
      setStatus('CLIProxyAPI stopped');
      await checkStatus();
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    await handleInstall();
  };

  const handleOpenManagement = () => {
    // CLIProxyAPI control panel is served on the same port
    window.open('http://127.0.0.1:8080', '_blank');
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-full">
      <h2 className="text-xl font-semibold text-white">AI Settings</h2>

      {/* CLIProxyAPI Status Card */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white">CLIProxyAPI Server</h3>
            <p className="text-sm text-gray-400">
              Provides Claude, Gemini, Codex via OAuth subscriptions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isRunning ? 'bg-green-500' : isInstalled ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-400">
              {isRunning ? 'Running' : isInstalled ? 'Stopped' : 'Not Installed'}
            </span>
          </div>
        </div>

        {/* Version info */}
        {version && (
          <div className="text-sm text-gray-400">
            Version: {version}
            {updateAvailable && (
              <span className="ml-2 text-primary-500">
                (Update available: {updateAvailable})
              </span>
            )}
          </div>
        )}

        {/* Server URL */}
        {isInstalled && (
          <div className="text-sm">
            <span className="text-gray-400">Server URL: </span>
            <code className="text-primary-500">{serverUrl}</code>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {!isInstalled ? (
            <Button onClick={handleInstall} disabled={isLoading}>
              {isLoading ? 'Installing...' : 'Install CLIProxyAPI'}
            </Button>
          ) : (
            <>
              {isRunning ? (
                <>
                  <Button variant="secondary" onClick={handleStop} disabled={isLoading}>
                    Stop Server
                  </Button>
                  <Button onClick={handleOpenManagement}>
                    Open Control Panel
                  </Button>
                </>
              ) : (
                <Button onClick={handleStart} disabled={isLoading}>
                  Start Server
                </Button>
              )}
              {updateAvailable && (
                <Button variant="ghost" onClick={handleUpdate} disabled={isLoading}>
                  Update
                </Button>
              )}
            </>
          )}
          <Button variant="ghost" onClick={checkStatus} disabled={isLoading}>
            Refresh
          </Button>
        </div>

        {/* Status/Error messages */}
        {error && (
          <div className="p-2 text-sm text-red-400 bg-red-900/20 rounded">
            {error}
          </div>
        )}
        {status && !error && (
          <div className="p-2 text-sm text-green-400 bg-green-900/20 rounded">
            {status}
          </div>
        )}
      </Card>

      {/* Available Models */}
      {isRunning && models.length > 0 && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">Available Models</h3>
            <span className="text-sm text-gray-400">{models.length} models</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {models.slice(0, 20).map((model) => (
              <span
                key={model.id}
                className="px-2 py-1 text-xs bg-surface-700 text-gray-300 rounded"
              >
                {model.id}
              </span>
            ))}
            {models.length > 20 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{models.length - 20} more
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4">
        <h3 className="font-medium text-white mb-2">Setup Instructions</h3>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>Click "Install CLIProxyAPI" to download the latest version</li>
          <li>Click "Start Server" to run the AI proxy</li>
          <li>Click "Open Control Panel" to add OAuth accounts (Claude, Gemini, etc.)</li>
          <li>Use AI Chat tab to interact with your connected AI providers</li>
        </ol>
      </Card>
    </div>
  );
}
