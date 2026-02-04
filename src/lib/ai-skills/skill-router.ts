/**
 * AI Skill Router
 * Routes user input to appropriate skills based on keyword matching
 */

import type { Skill } from './types';
import { skills, getFallbackSkill } from './skill-registry';

/**
 * Route user input to the most appropriate skill
 * Uses keyword matching with priority based on skills array order
 *
 * @param userInput - The user's message
 * @returns The matched skill, or fallback if no match
 */
export function routeToSkill(userInput: string): Skill {
  const inputLower = userInput.toLowerCase();

  // Check each skill's triggers (priority = array order)
  for (const skill of skills) {
    // Skip skills with no triggers (fallback)
    if (skill.triggers.length === 0) continue;

    // Match if any trigger keyword is found
    if (skill.triggers.some(trigger => inputLower.includes(trigger))) {
      return skill;
    }
  }

  // No match found, use fallback
  return getFallbackSkill();
}

/**
 * Get all skills that match the input (for debugging/UI)
 *
 * @param userInput - The user's message
 * @returns Array of matching skills with their trigger matches
 */
export function getMatchingSkills(userInput: string): Array<{ skill: Skill; matchedTriggers: string[] }> {
  const inputLower = userInput.toLowerCase();
  const matches: Array<{ skill: Skill; matchedTriggers: string[] }> = [];

  for (const skill of skills) {
    const matchedTriggers = skill.triggers.filter(trigger =>
      inputLower.includes(trigger)
    );

    if (matchedTriggers.length > 0) {
      matches.push({ skill, matchedTriggers });
    }
  }

  return matches;
}

/**
 * Force route to a specific skill by ID
 *
 * @param skillId - The skill ID to use
 * @returns The skill, or fallback if not found
 */
export function forceSkill(skillId: string): Skill {
  const skill = skills.find(s => s.id === skillId);
  return skill ?? getFallbackSkill();
}
