export interface SSMLConfig {
  rate?: 'x-slow' | 'slow' | 'medium' | 'fast' | 'x-fast';
  pitch?: 'x-low' | 'low' | 'medium' | 'high' | 'x-high' | string;
  volume?: 'silent' | 'x-soft' | 'soft' | 'medium' | 'loud' | 'x-loud';
  emphasis?: 'strong' | 'moderate' | 'reduced';
}

// Updated SSML mapping presets as specified
const ssmlTemplates: Record<string, string> = {
  "tease": "<speak><prosody rate='medium' pitch='high'>{{TEXT}}</prosody></speak>",
  "moan": "<speak><prosody rate='slow' pitch='+4st'>{{TEXT}}</prosody></speak>",
  "soothe": "<speak><prosody rate='slow' pitch='low'>{{TEXT}}</prosody></speak>",
  "mock": "<speak><prosody rate='fast' pitch='high'>{{TEXT}}</prosody></speak>",
  "praise": "<speak><prosody rate='medium' pitch='+2st'>{{TEXT}}</prosody></speak>",
  "whisper": "<speak><prosody volume='x-soft' rate='slow'>{{TEXT}}</prosody></speak>",
  // Keep existing emotion presets for backward compatibility
  "calm": "<speak><prosody rate='slow' pitch='low' volume='soft'>{{TEXT}}</prosody></speak>",
  "encourage": "<speak><prosody rate='medium' pitch='medium'><emphasis level='strong'>{{TEXT}}</emphasis></prosody></speak>",
  "laugh": "<speak><prosody rate='fast' pitch='high'><emphasis level='strong'>{{TEXT}}</emphasis></prosody></speak>",
  "gasp": "<speak><prosody rate='fast' pitch='x-high'><emphasis level='strong'>{{TEXT}}</emphasis></prosody></speak>",
  "humiliate": "<speak><prosody rate='medium' pitch='high'>{{TEXT}}</prosody></speak>",
  "affirmation": "<speak><prosody rate='slow' pitch='medium' volume='soft'>{{TEXT}}</prosody></speak>",
  "command": "<speak><prosody rate='medium' pitch='medium'><emphasis level='strong'>{{TEXT}}</emphasis></prosody></speak>"
};

export const generateSSML = (text: string, emotion?: string): string => {
  if (!emotion || !ssmlTemplates[emotion]) {
    // Default wrapping for text without slash command
    return `<speak>${text}</speak>`;
  }

  // Use the template and replace {{TEXT}} with actual text
  return ssmlTemplates[emotion].replace('{{TEXT}}', text);
};

export const parseSlashCommand = (input: string): { command?: string; text: string; ssml?: string } => {
  const match = input.match(/^\/(\w+)\s+(.+)$/);
  if (match) {
    const command = match[1];
    const text = match[2];
    const ssml = generateSSML(text, command);
    return { command, text, ssml };
  }
  // Return with default SSML wrapping for non-slash commands
  return { text: input, ssml: generateSSML(input) };
};
