import { invoke } from '@tauri-apps/api/core';

export interface ChatMessage {
  role: string;
  content: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  tokens?: number;
}

export const audioApi = {
  play: (path: string) => invoke<void>('play_audio', { path }),
  pause: () => invoke<void>('pause_audio'),
  resume: () => invoke<void>('resume_audio'),
  stop: () => invoke<void>('stop_audio'),
  setVolume: (volume: number) => invoke<void>('set_volume', { volume }),
};

export const aiApi = {
  complete: (messages: ChatMessage[], model?: string) => invoke<AIResponse>('ai_complete', { messages, model }),
  listProviders: () => invoke<string[]>('list_ai_providers'),
  setProvider: (name: string) => invoke<void>('set_ai_provider', { name }),
};

export const midiApi = {
  listInputPorts: () => invoke<string[]>('list_midi_input_ports'),
  listOutputPorts: () => invoke<string[]>('list_midi_output_ports'),
};

// CLIProxyAPI manager - handles download, install, and lifecycle
export const cliproxyApi = {
  isInstalled: () => invoke<boolean>('cliproxyapi_is_installed'),
  download: () => invoke<string>('cliproxyapi_download'),
  start: () => invoke<void>('cliproxyapi_start'),
  stop: () => invoke<void>('cliproxyapi_stop'),
  isRunning: () => invoke<boolean>('cliproxyapi_is_running'),
  getUrl: () => invoke<string>('cliproxyapi_get_url'),
  getVersion: () => invoke<string | null>('cliproxyapi_get_version'),
  checkUpdate: () => invoke<string | null>('cliproxyapi_check_update'),
};

// CLIProxyAPI direct HTTP calls (when server is running)
export interface CLIProxyModel {
  id: string;
  object: string;
  owned_by: string;
}

export interface CLIProxyAuthFile {
  id: string;
  name: string;
  provider: string;
  label: string;
  status: string;
  email?: string;
  disabled: boolean;
}

export interface OAuthUrlResponse {
  status: string;
  url: string;
  state: string;
}

const CLIPROXY_BASE = 'http://127.0.0.1:8080';
const CLIPROXY_MANAGEMENT_KEY = 'openmusic-local';

export const cliproxyHttpApi = {
  // List available models
  listModels: async (): Promise<CLIProxyModel[]> => {
    const res = await fetch(`${CLIPROXY_BASE}/v1/models`);
    if (!res.ok) throw new Error(`Failed to list models: ${res.status}`);
    const data = await res.json();
    return data.data || [];
  },

  // List auth accounts
  listAuthFiles: async (): Promise<CLIProxyAuthFile[]> => {
    const res = await fetch(`${CLIPROXY_BASE}/v0/management/auth-files`, {
      headers: { 'X-Management-Key': CLIPROXY_MANAGEMENT_KEY }
    });
    if (!res.ok) {
      if (res.status === 404) return []; // Management API not enabled
      throw new Error(`Failed to list auth files: ${res.status}`);
    }
    const data = await res.json();
    return data.files || [];
  },

  // Start OAuth login flow
  startOAuthLogin: async (provider: 'claude' | 'gemini' | 'codex' | 'antigravity'): Promise<OAuthUrlResponse> => {
    const endpoints: Record<string, string> = {
      claude: '/v0/management/anthropic-auth-url?is_webui=true',
      gemini: '/v0/management/gemini-cli-auth-url?is_webui=true',
      codex: '/v0/management/codex-auth-url?is_webui=true',
      antigravity: '/v0/management/antigravity-auth-url?is_webui=true',
    };

    const res = await fetch(`${CLIPROXY_BASE}${endpoints[provider]}`, {
      headers: { 'X-Management-Key': CLIPROXY_MANAGEMENT_KEY }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Failed to start OAuth: ${res.status}`);
    }
    return res.json();
  },

  // Check OAuth status
  checkOAuthStatus: async (state: string): Promise<{ status: string; error?: string }> => {
    const res = await fetch(`${CLIPROXY_BASE}/v0/management/get-auth-status?state=${state}`, {
      headers: { 'X-Management-Key': CLIPROXY_MANAGEMENT_KEY }
    });
    if (!res.ok) throw new Error(`Failed to check OAuth status: ${res.status}`);
    return res.json();
  },

  // Health check
  isAvailable: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${CLIPROXY_BASE}/v1/models`, {
        signal: AbortSignal.timeout(2000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Delete auth file by name
  deleteAuthFile: async (name: string): Promise<void> => {
    const res = await fetch(
      `${CLIPROXY_BASE}/v0/management/auth-files?name=${encodeURIComponent(name)}`,
      {
        method: 'DELETE',
        headers: { 'X-Management-Key': CLIPROXY_MANAGEMENT_KEY }
      }
    );
    if (!res.ok) throw new Error(`Failed to delete auth file: ${res.status}`);
  },
};
