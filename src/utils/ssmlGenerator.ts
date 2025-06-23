
export interface SSMLConfig {
  rate?: 'x-slow' | 'slow' | 'medium' | 'fast' | 'x-fast';
  pitch?: 'x-low' | 'low' | 'medium' | 'high' | 'x-high';
  volume?: 'silent' | 'x-soft' | 'soft' | 'medium' | 'loud' | 'x-loud';
  emphasis?: 'strong' | 'moderate' | 'reduced';
}

const emotionPresets: Record<string, SSMLConfig> = {
  tease: { rate: 'slow', pitch: 'high', emphasis: 'moderate' },
  calm: { rate: 'slow', pitch: 'low', volume: 'soft' },
  encourage: { rate: 'medium', pitch: 'medium', emphasis: 'strong' },
  whisper: { rate: 'slow', pitch: 'low', volume: 'x-soft' },
  moan: { rate: 'x-slow', pitch: 'low', volume: 'soft' },
  laugh: { rate: 'fast', pitch: 'high', emphasis: 'strong' },
  gasp: { rate: 'fast', pitch: 'x-high', emphasis: 'strong' },
  humiliate: { rate: 'medium', pitch: 'high', emphasis: 'moderate' },
  affirmation: { rate: 'slow', pitch: 'medium', volume: 'soft' },
  command: { rate: 'medium', pitch: 'medium', emphasis: 'strong' }
};

export const generateSSML = (text: string, emotion?: string): string => {
  const config = emotion ? emotionPresets[emotion] : undefined;
  
  if (!config) {
    return text; // Return plain text if no emotion mapping
  }

  let ssml = '<speak>';
  
  // Add prosody tags based on config
  const prosodyAttributes: string[] = [];
  if (config.rate) prosodyAttributes.push(`rate="${config.rate}"`);
  if (config.pitch) prosodyAttributes.push(`pitch="${config.pitch}"`);
  if (config.volume) prosodyAttributes.push(`volume="${config.volume}"`);
  
  if (prosodyAttributes.length > 0) {
    ssml += `<prosody ${prosodyAttributes.join(' ')}>`;
  }
  
  // Add emphasis if specified
  if (config.emphasis) {
    ssml += `<emphasis level="${config.emphasis}">`;
  }
  
  // Add the text content
  ssml += text;
  
  // Close tags in reverse order
  if (config.emphasis) {
    ssml += '</emphasis>';
  }
  
  if (prosodyAttributes.length > 0) {
    ssml += '</prosody>';
  }
  
  ssml += '</speak>';
  
  return ssml;
};

export const parseSlashCommand = (input: string): { command?: string; text: string; ssml?: string } => {
  const match = input.match(/^\/(\w+)\s+(.+)$/);
  if (match) {
    const command = match[1];
    const text = match[2];
    const ssml = generateSSML(text, command);
    return { command, text, ssml };
  }
  return { text: input };
};
