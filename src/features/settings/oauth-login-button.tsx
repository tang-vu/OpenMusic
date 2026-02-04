import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-shell';
import { cliproxyHttpApi } from '@/lib/tauri-api';
import { Button } from '@/components/ui/button';

type Provider = 'claude' | 'gemini' | 'codex' | 'antigravity';

interface Props {
  provider: Provider;
  onSuccess: () => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const PROVIDER_LABELS: Record<Provider, string> = {
  claude: 'Claude',
  gemini: 'Gemini',
  codex: 'Codex',
  antigravity: 'Antigravity',
};

export function OAuthLoginButton({ provider, onSuccess, onError, disabled }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [oauthState, setOauthState] = useState<string | null>(null);

  // Poll OAuth status
  useEffect(() => {
    if (!oauthState) return;

    const interval = setInterval(async () => {
      try {
        const result = await cliproxyHttpApi.checkOAuthStatus(oauthState);
        if (result.status === 'ok') {
          setOauthState(null);
          setIsLoading(false);
          onSuccess();
        } else if (result.status === 'error') {
          setOauthState(null);
          setIsLoading(false);
          onError(result.error || 'OAuth failed');
        }
      } catch {
        // Keep polling
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [oauthState, onSuccess, onError]);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await cliproxyHttpApi.startOAuthLogin(provider);
      await open(response.url);
      setOauthState(response.state);
    } catch (e) {
      setIsLoading(false);
      onError(String(e));
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="min-w-[120px]"
    >
      {isLoading ? 'Waiting...' : `Add ${PROVIDER_LABELS[provider]}`}
    </Button>
  );
}
