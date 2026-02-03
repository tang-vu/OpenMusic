import { aiApi, ChatMessage, AIResponse } from '@/lib/tauri-api';
import { useState, useCallback } from 'react';

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = useCallback(async (messages: ChatMessage[]): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await aiApi.complete(messages);
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listProviders = useCallback(async () => {
    return aiApi.listProviders();
  }, []);

  return { complete, listProviders, isLoading, error };
}
