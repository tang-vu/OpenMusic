import { useState } from 'react';
import { cliproxyHttpApi, type CLIProxyAuthFile } from '@/lib/tauri-api';
import { Button } from '@/components/ui/button';

interface Props {
  accounts: CLIProxyAuthFile[];
  onRefresh: () => void;
  isLoading?: boolean;
}

const PROVIDER_COLORS: Record<string, string> = {
  claude: 'bg-orange-500',
  gemini: 'bg-blue-500',
  codex: 'bg-green-500',
  antigravity: 'bg-purple-500',
};

export function ConnectedAccountsList({ accounts, onRefresh, isLoading }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (account: CLIProxyAuthFile) => {
    if (!confirm(`Remove ${account.label || account.name}?`)) return;

    setDeletingId(account.id);
    try {
      await cliproxyHttpApi.deleteAuthFile(account.name);
      onRefresh();
    } catch (e) {
      console.error('Failed to delete:', e);
    } finally {
      setDeletingId(null);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-4 text-center">
        No accounts connected. Add one above.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="flex items-center justify-between p-3 bg-surface-700 rounded-lg"
        >
          <div className="flex items-center gap-3">
            {/* Provider indicator */}
            <div
              className={`w-3 h-3 rounded-full ${
                PROVIDER_COLORS[account.provider] || 'bg-gray-500'
              }`}
            />
            <div>
              <div className="text-sm text-white">
                {account.label || account.name}
              </div>
              <div className="text-xs text-gray-400">
                {account.provider}
                {account.email && ` - ${account.email}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status */}
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                account.status === 'ok'
                  ? 'bg-green-900/30 text-green-400'
                  : 'bg-yellow-900/30 text-yellow-400'
              }`}
            >
              {account.status}
            </span>

            {/* Delete button */}
            <Button
              variant="ghost"
              onClick={() => handleDelete(account)}
              disabled={deletingId === account.id || isLoading}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs px-2 py-1"
            >
              {deletingId === account.id ? '...' : 'Remove'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
