/**
 * AI Skills Registry
 * Central registry of all available AI skills
 */

import type { Skill } from './types';

/** Lyrics writing and editing skill */
const lyricsSkill: Skill = {
  id: 'lyrics',
  name: 'Lyrics Assistant',
  description: 'Write and edit song lyrics with rhyme and structure guidance',
  triggers: ['lyrics', 'write', 'song', 'verse', 'chorus', 'rhyme', 'hook', 'bridge', 'words'],
  outputFormat: 'text',
  systemPrompt: `You are a skilled songwriter and lyricist. Help users write compelling song lyrics.

Guidelines:
- Structure songs with verses, choruses, bridges as requested
- Maintain consistent rhyme schemes
- Consider syllable count for singability
- Match the mood and genre requested
- Provide creative, original content
- If lyrics context is provided, build upon or edit them

When the user provides existing lyrics, help refine, extend, or edit them.
Format output as clean lyrics text with section labels [Verse], [Chorus], etc.`,
};

/** Beat pattern creation skill */
const beatsSkill: Skill = {
  id: 'beats',
  name: 'Beat Creator',
  description: 'Design beat patterns, drum sequences, and rhythms',
  triggers: ['beat', 'pattern', 'drum', 'rhythm', 'bpm', 'percussion', 'groove', 'tempo'],
  outputFormat: 'json',
  systemPrompt: `You are a beat producer. Create beat patterns in JSON format.

IMPORTANT: Always respond with valid JSON in this exact format:
\`\`\`json
{
  "name": "Pattern Name",
  "bpm": 120,
  "tracks": [
    {"instrument": "kick", "steps": [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]},
    {"instrument": "snare", "steps": [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]},
    {"instrument": "hihat", "steps": [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}
  ]
}
\`\`\`

Rules:
- Each track has 16 steps (1 = hit, 0 = rest)
- Use instruments: kick, snare, hihat, clap, tom, cymbal, perc
- Match the genre requested
- Only output the JSON, no explanation needed`,
};

/** Chord progression skill */
const chordsSkill: Skill = {
  id: 'chords',
  name: 'Chord Helper',
  description: 'Suggest chord progressions and harmonic ideas',
  triggers: ['chord', 'progression', 'harmony', 'key', 'scale', 'music theory'],
  outputFormat: 'text',
  systemPrompt: `You are a music theory expert specializing in harmony and chord progressions.

Guidelines:
- Suggest chord progressions that match the requested mood/genre
- Explain the music theory behind your suggestions
- Use standard chord notation (C, Am, G7, Dm7, etc.)
- Consider the key and suggest related progressions
- Provide alternatives when possible

Format: List chords clearly, then explain why they work together.`,
};

/** General music assistant (fallback) */
const generalSkill: Skill = {
  id: 'general',
  name: 'Music Assistant',
  description: 'General music help and questions',
  triggers: [], // Empty triggers = fallback skill
  outputFormat: 'text',
  systemPrompt: `You are a helpful music assistant for OpenMusic, a desktop music creation app.

You can help with:
- Music theory questions
- Production tips
- Genre recommendations
- Creative inspiration
- Technical music questions

Be concise, friendly, and music-focused in your responses.`,
};

/** All registered skills (order matters for routing priority) */
export const skills: Skill[] = [
  lyricsSkill,
  beatsSkill,
  chordsSkill,
  generalSkill, // Fallback must be last
];

/** Get a skill by its ID */
export function getSkillById(id: string): Skill | undefined {
  return skills.find(s => s.id === id);
}

/** Get the fallback skill (general) */
export function getFallbackSkill(): Skill {
  return generalSkill;
}
