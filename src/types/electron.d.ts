
export interface ElectronAPI {
  getVoices: () => Promise<Array<{
    name: string;
    languageCode: string;
    gender: string;
  }>>;
  synthesize: (params: {
    text: string;
    voiceName: string;
  }) => Promise<void>;
  startStreaming: (params: {
    voiceName: string;
  }) => Promise<void>;
  stopStreaming: () => Promise<void>;
  sendAudio: (audioChunk: ArrayBuffer) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
