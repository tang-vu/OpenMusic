/**
 * useAISkills Hook
 * React hook for skill-aware AI completions
 */

import { useCallback, useState } from 'react';
import { aiApi } from '@/lib/tauri-api';
import {
  routeToSkill,
  forceSkill,
  buildFullContext,
  formatContextForPrompt,
  parseJsonResponse,
  type Skill,
  type SkillContext,
  type SkillResponse,
} from '@/lib/ai-skills';

interface UseAISkillsOptions {
  /** Optional default context to always include */
  defaultContext?: Partial<SkillContext>;
}

interface CompleteOptions {
  /** Force a specific skill instead of auto-routing */
  skillId?: string;
  /** Additional context to merge with defaults */
  context?: Partial<SkillContext>;
}

export function useAISkills(options?: UseAISkillsOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);

  /**
   * Complete a message using skill-based routing
   */
  const complete = useCallback(
    async (userMessage: string, completeOptions?: CompleteOptions): Promise<SkillResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        // Determine which skill to use
        const skill = completeOptions?.skillId
          ? forceSkill(completeOptions.skillId)
          : routeToSkill(userMessage);

        setActiveSkill(skill);

        // Build context from options and defaults
        const defaultCtx = options?.defaultContext;
        const optCtx = completeOptions?.context;
        const context = buildFullContext({
          lyrics: optCtx?.currentLyrics ?? defaultCtx?.currentLyrics,
          beat: optCtx?.currentBeat ?? defaultCtx?.currentBeat,
          track: optCtx?.currentTrack ?? defaultCtx?.currentTrack,
          preferences: optCtx?.userPreferences ?? defaultCtx?.userPreferences,
        });

        // Format context for prompt injection
        const contextString = formatContextForPrompt(context);

        // Construct system message with skill prompt + context
        const systemContent = skill.systemPrompt + contextString;

        // Call the AI API
        const response = await aiApi.complete([
          { role: 'system', content: systemContent },
          { role: 'user', content: userMessage },
        ]);

        // Parse response if JSON format expected
        const parsed =
          skill.outputFormat === 'json'
            ? parseJsonResponse(response.content) ?? undefined
            : undefined;

        return {
          content: response.content,
          skillId: skill.id,
          parsed,
          provider: response.provider,
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options?.defaultContext]
  );

  /**
   * Complete with a specific skill (bypasses auto-routing)
   */
  const completeWithSkill = useCallback(
    async (
      skillId: string,
      userMessage: string,
      context?: Partial<SkillContext>
    ): Promise<SkillResponse> => {
      return complete(userMessage, { skillId, context });
    },
    [complete]
  );

  /**
   * Get the skill that would be used for a given input (for preview)
   */
  const previewSkill = useCallback((userMessage: string): Skill => {
    return routeToSkill(userMessage);
  }, []);

  return {
    complete,
    completeWithSkill,
    previewSkill,
    isLoading,
    error,
    activeSkill,
  };
}
