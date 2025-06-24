
export interface TTSRequest {
  text: string;
  voiceName: string;
  languageCode: string;
  ssmlGender?: 'NEUTRAL' | 'FEMALE' | 'MALE';
  audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
  speakingRate?: number;
  pitch?: number;
}

export interface TTSResponse {
  audioContent: string;
  latency: number;
}

export interface GoogleVoice {
  name: string;
  languageCodes: string[];
  ssmlGender: 'NEUTRAL' | 'FEMALE' | 'MALE';
  naturalSampleRateHertz: number;
}

export class GoogleTTSService {
  private accessToken: string;
  private baseUrl = 'https://texttospeech.googleapis.com/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getVoices(): Promise<GoogleVoice[]> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Voices fetched in ${Date.now() - startTime}ms`);
      
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    const startTime = Date.now();

    try {
      const payload = {
        input: { text: request.text },
        voice: {
          languageCode: request.languageCode,
          name: request.voiceName,
          ssmlGender: request.ssmlGender || 'NEUTRAL'
        },
        audioConfig: {
          audioEncoding: request.audioEncoding || 'MP3',
          speakingRate: request.speakingRate || 1.0,
          pitch: request.pitch || 0.0
        }
      };

      const response = await fetch(`${this.baseUrl}/text:synthesize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`TTS API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        audioContent: data.audioContent,
        latency
      };
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error;
    }
  }

  async synthesizeSSML(ssml: string, voiceName: string, languageCode: string): Promise<TTSResponse> {
    const startTime = Date.now();

    try {
      const payload = {
        input: { ssml },
        voice: {
          languageCode,
          name: voiceName
        },
        audioConfig: {
          audioEncoding: 'MP3'
        }
      };

      const response = await fetch(`${this.baseUrl}/text:synthesize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`TTS API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        audioContent: data.audioContent,
        latency
      };
    } catch (error) {
      console.error('Error synthesizing SSML:', error);
      throw error;
    }
  }
}

export const playAudioFromBase64 = (base64Audio: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const audioData = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioData);
      
      audio.onended = () => resolve();
      audio.onerror = (error) => reject(error);
      
      audio.play().catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};
