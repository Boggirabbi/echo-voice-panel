
import { useState, useEffect } from "react";
import { EmotionProfile, SessionLogEntry, EmotionSound } from "@/types/electron";
import ModeSelector from "./ModeSelector";
import TextToSpeak from "./TextToSpeak";
import EmotionBoard from "./EmotionBoard";
import EmotionProfileSelector from "./EmotionProfile";
import SpeechToSpeechToggle from "./SpeechToSpeechToggle";
import SessionStatus from "./SessionStatus";
import SessionLog from "./SessionLog";
import LatencyIndicator from "./LatencyIndicator";

type AppMode = 'text' | 'stt' | 'emotion';

const VoiceConsole = () => {
  // Core state
  const [currentMode, setCurrentMode] = useState<AppMode>('text');
  const [sessionStatus, setSessionStatus] = useState<"idle" | "listening" | "processing">("idle");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLatency, setCurrentLatency] = useState<number>(0);

  // Voice and emotion profiles
  const [emotionProfiles] = useState<EmotionProfile[]>([
    { id: 'calm', name: 'Calm Therapist', voiceName: 'en-US-Standard-A', speed: 0.9, pitch: -2, style: 'calm' },
    { id: 'tease', name: 'Teasing Girl', voiceName: 'en-US-Standard-C', speed: 1.1, pitch: 3, style: 'playful' },
    { id: 'coach', name: 'Encouraging Coach', voiceName: 'en-US-Standard-D', speed: 1.0, pitch: 1, style: 'motivational' }
  ]);
  const [selectedProfile, setSelectedProfile] = useState('calm');

  // Emotion sounds
  const [emotionSounds] = useState<EmotionSound[]>([
    { id: 'laugh', name: 'Laugh', hotkey: 'F1', type: 'tts', content: '*giggles softly*' },
    { id: 'gasp', name: 'Gasp', hotkey: 'F2', type: 'tts', content: '*gasps in surprise*' },
    { id: 'sigh', name: 'Sigh', hotkey: 'F3', type: 'tts', content: '*sighs thoughtfully*' },
    { id: 'hmm', name: 'Thinking', hotkey: 'F4', type: 'tts', content: 'Hmm, interesting...' },
    { id: 'wow', name: 'Amazed', hotkey: 'F5', type: 'tts', content: 'Wow, that\'s incredible!' },
    { id: 'comfort', name: 'Comfort', hotkey: 'F6', type: 'tts', content: 'It\'s okay, take your time.' }
  ]);

  // Session logging
  const [sessionLog, setSessionLog] = useState<SessionLogEntry[]>([]);

  const addLogEntry = (type: SessionLogEntry['type'], content: string, emotion?: string, latency?: number) => {
    const entry: SessionLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      content,
      emotion,
      latency
    };
    setSessionLog(prev => [entry, ...prev]);
  };

  const handleSpeak = async (text: string, command?: string) => {
    if (!text.trim()) return;
    
    const startTime = Date.now();
    setIsSpeaking(true);
    setSessionStatus("processing");

    try {
      const profile = emotionProfiles.find(p => p.id === selectedProfile) || emotionProfiles[0];
      
      // Apply command-based emotion overrides
      let activeProfile = profile;
      if (command) {
        const commandProfile = emotionProfiles.find(p => p.id === command);
        if (commandProfile) {
          activeProfile = commandProfile;
        }
      }

      if (window.electronAPI?.synthesize) {
        await window.electronAPI.synthesize({
          text,
          voiceName: activeProfile.voiceName,
          speed: activeProfile.speed,
          pitch: activeProfile.pitch
        });
      } else {
        // Demo mode
        console.log(`[DEMO] Speaking: "${text}" with profile: ${activeProfile.name}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const latency = Date.now() - startTime;
      setCurrentLatency(latency);
      addLogEntry('tts', text, activeProfile.name, latency);
    } catch (error) {
      console.error("Failed to synthesize text:", error);
    } finally {
      setIsSpeaking(false);
      setSessionStatus("idle");
    }
  };

  const handleEmotionTrigger = async (emotionId: string) => {
    const emotion = emotionSounds.find(e => e.id === emotionId);
    if (!emotion) return;

    const startTime = Date.now();
    setSessionStatus("processing");

    try {
      if (emotion.type === 'tts') {
        await handleSpeak(emotion.content);
      } else {
        // Audio file playback
        if (window.electronAPI?.playEmotionSound) {
          await window.electronAPI.playEmotionSound(emotionId);
        }
      }

      const latency = Date.now() - startTime;
      addLogEntry('emotion', emotion.content, emotion.name, latency);
    } catch (error) {
      console.error("Failed to trigger emotion:", error);
    } finally {
      setSessionStatus("idle");
    }
  };

  const handleToggleListening = async () => {
    try {
      if (isListening) {
        if (window.electronAPI?.stopStreaming) {
          await window.electronAPI.stopStreaming();
        }
        setIsListening(false);
        setSessionStatus("idle");
      } else {
        const profile = emotionProfiles.find(p => p.id === selectedProfile) || emotionProfiles[0];
        if (window.electronAPI?.startStreaming) {
          await window.electronAPI.startStreaming({ voiceName: profile.voiceName });
        }
        setIsListening(true);
        setSessionStatus("listening");
      }
    } catch (error) {
      console.error("Failed to toggle listening:", error);
      setIsListening(false);
      setSessionStatus("idle");
    }
  };

  // Keyboard shortcuts for emotions
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const emotion = emotionSounds.find(em => em.hotkey === e.code || em.hotkey === e.key);
      if (emotion && !e.repeat) {
        e.preventDefault();
        handleEmotionTrigger(emotion.id);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [emotionSounds]);

  const isProcessing = sessionStatus === "processing" || isSpeaking;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative">
      <LatencyIndicator currentLatency={currentLatency} />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Exposure Voice Console</h1>
          <p className="text-gray-400">Real-Time Desktop Companion for AI Voice Sessions</p>
        </div>

        {/* Mode Selector */}
        <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Always show emotion profile selector */}
            <EmotionProfileSelector
              profiles={emotionProfiles}
              selectedProfile={selectedProfile}
              onProfileChange={setSelectedProfile}
            />

            {/* Conditional components based on mode */}
            {(currentMode === 'text' || currentMode === 'stt') && (
              <TextToSpeak
                onSpeak={handleSpeak}
                disabled={isProcessing}
                isSpeaking={isSpeaking}
              />
            )}

            {currentMode === 'stt' && (
              <SpeechToSpeechToggle
                isListening={isListening}
                onToggle={handleToggleListening}
                disabled={isProcessing}
              />
            )}

            <SessionStatus status={sessionStatus} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <EmotionBoard
              emotions={emotionSounds}
              onEmotionTrigger={handleEmotionTrigger}
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Session Log - Full Width */}
        <SessionLog entries={sessionLog} />
      </div>
    </div>
  );
};

export default VoiceConsole;
