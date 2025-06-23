
import { useState, useEffect } from "react";
import { SessionLogEntry, EmotionSound } from "@/types/electron";
import ModeSelector from "./ModeSelector";
import TextToSpeak from "./TextToSpeak";
import EmotionBoard from "./EmotionBoard";
import VoiceSelector from "./VoiceSelector";
import SpeechToSpeechToggle from "./SpeechToSpeechToggle";
import SessionStatus from "./SessionStatus";
import SessionLog from "./SessionLog";
import LatencyIndicator from "./LatencyIndicator";
import CustomEmotionCreator from "./CustomEmotionCreator";
import StreamDeckIntegration from "./StreamDeckIntegration";

type AppMode = 'text' | 'stt' | 'emotion';

const VoiceConsole = () => {
  // Core state
  const [currentMode, setCurrentMode] = useState<AppMode>('text');
  const [sessionStatus, setSessionStatus] = useState<"idle" | "listening" | "processing">("idle");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLatency, setCurrentLatency] = useState<number>(0);

  // Voice selection - now uses Google Cloud voices
  const [selectedVoice, setSelectedVoice] = useState<string>("en-US-Wavenet-C");

  // Emotion sounds - expanded with adult content
  const [emotionSounds, setEmotionSounds] = useState<EmotionSound[]>([
    { id: 'laugh', name: 'Laugh', hotkey: 'F1', type: 'tts', content: '*giggles softly*' },
    { id: 'gasp', name: 'Gasp', hotkey: 'F2', type: 'tts', content: '*gasps in surprise*' },
    { id: 'sigh', name: 'Sigh', hotkey: 'F3', type: 'tts', content: '*sighs thoughtfully*' },
    { id: 'encourage', name: 'Good Boy', hotkey: 'F4', type: 'tts', content: 'Good boy, keep going for me...' },
    { id: 'tease', name: 'Is That All?', hotkey: 'F5', type: 'tts', content: 'Is that all you can do? How cute...' },
    { id: 'moan', name: 'Soft Moan', hotkey: 'F6', type: 'tts', content: '*moans softly* Mmm, yes...' },
    { id: 'whisper', name: 'Seductive Whisper', hotkey: 'F7', type: 'tts', content: '*whispers seductively* You\'re doing this just for me, aren\'t you?' },
    { id: 'affirmation', name: 'You\'re Mine', hotkey: 'F8', type: 'tts', content: 'You\'re such a good little toy for me...' },
    { id: 'humiliation', name: 'Pathetic', hotkey: 'F9', type: 'tts', content: 'How pathetic... but I love watching you try so hard.' },
    { id: 'praise', name: 'Perfect', hotkey: 'F10', type: 'tts', content: '*breathily* Perfect... just like that, don\'t stop...' },
    { id: 'command', name: 'Obey Me', hotkey: 'F11', type: 'tts', content: 'Now be a good boy and obey me completely...' },
    { id: 'reward', name: 'Such a Good Pet', hotkey: 'F12', type: 'tts', content: 'Such a good pet... you deserve a reward, don\'t you?' }
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

  const handleSpeak = async (text: string, voiceOverride?: string) => {
    if (!text.trim()) return;
    
    const startTime = Date.now();
    setIsSpeaking(true);
    setSessionStatus("processing");

    try {
      const voiceToUse = voiceOverride || selectedVoice;

      if (window.electronAPI?.synthesize) {
        await window.electronAPI.synthesize({
          text,
          voiceName: voiceToUse,
          speed: 1.0,
          pitch: 0
        });
      } else {
        // Demo mode
        console.log(`[DEMO] Speaking: "${text}" with voice: ${voiceToUse}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const latency = Date.now() - startTime;
      setCurrentLatency(latency);
      addLogEntry('tts', text, voiceToUse, latency);
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

  const handleCreateCustomEmotion = async (newEmotion: Omit<EmotionSound, 'id'>) => {
    const id = `custom_${Date.now()}`;
    const emotion: EmotionSound = { ...newEmotion, id };
    
    setEmotionSounds(prev => [...prev, emotion]);
    
    // Test the new emotion immediately to ensure it works
    if (emotion.type === 'tts') {
      await handleSpeak(emotion.content);
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
        if (window.electronAPI?.startStreaming) {
          await window.electronAPI.startStreaming({ voiceName: selectedVoice });
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
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Exposure Voice Console</h1>
          <p className="text-gray-400">Real-Time Desktop Companion for AI Voice Sessions</p>
        </div>

        {/* Mode Selector */}
        <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Primary Controls */}
          <div className="space-y-6">
            <VoiceSelector
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              disabled={isProcessing}
            />

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

          {/* Middle Column - Emotion Controls */}
          <div className="space-y-6">
            <EmotionBoard
              emotions={emotionSounds}
              onEmotionTrigger={handleEmotionTrigger}
              disabled={isProcessing}
            />

            <CustomEmotionCreator
              onCreateEmotion={handleCreateCustomEmotion}
              disabled={isProcessing}
            />
          </div>

          {/* Right Column - Advanced Features */}
          <div className="space-y-6">
            <StreamDeckIntegration
              emotions={emotionSounds}
              onTriggerEmotion={handleEmotionTrigger}
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
