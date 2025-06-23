export interface ElectronAPI {
  // Voice synthesis
  getVoices: () => Promise<Voice[]>;
  synthesize: (params: { text: string; voiceName: string; speed?: number; pitch?: number; ssml?: boolean }) => Promise<void>;
  
  // Speech-to-speech
  startStreaming: (params: { voiceName: string }) => Promise<void>;
  stopStreaming: () => Promise<void>;
  sendAudio: (audioChunk: ArrayBuffer) => Promise<void>;
  
  // Emotion sounds
  playEmotionSound: (soundId: string) => Promise<void>;
  
  // Stream Deck integration
  connectStreamDeck: () => Promise<void>;
  disconnectStreamDeck: () => Promise<void>;
  mapStreamDeckButton: (params: { buttonId: number; emotionId: string; label: string }) => Promise<void>;
  reloadStreamDeckMappings: () => Promise<void>;
  
  // Performance monitoring
  getLatencyStats: () => Promise<{ avgLatency: number }>;
}

export interface Voice {
  name: string;
  languageCode: string;
  gender: string;
}

export interface EmotionProfile {
  id: string;
  name: string;
  voiceName: string;
  speed: number;
  pitch: number;
  style: string;
}

export interface SessionLogEntry {
  id: string;
  timestamp: Date;
  type: 'tts' | 'stt' | 'emotion';
  content: string;
  emotion?: string;
  latency?: number;
}

export interface EmotionSound {
  id: string;
  name: string;
  hotkey: string;
  type: 'audio' | 'tts';
  content: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
