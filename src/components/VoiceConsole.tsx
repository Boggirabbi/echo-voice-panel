
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
import GoogleLogin from "./GoogleLogin";
import { generateSSML } from "@/utils/ssmlGenerator";
import { GoogleTTSService, playAudioFromBase64 } from "@/services/googleTTS";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

type AppMode = 'text' | 'stt' | 'emotion';

const VoiceConsole = () => {
  // Authentication
  const { user, accessToken } = useGoogleAuth();

  // Core state
  const [currentMode, setCurrentMode] = useState<AppMode>('text');
  const [sessionStatus, setSessionStatus] = useState<"idle" | "listening" | "processing">("idle");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLatency, setCurrentLatency] = useState<number>(0);
  const [shouldRestartListening, setShouldRestartListening] = useState(false);

  // Voice selection - Google Cloud voices
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  // Audio replay
  const [lastAudioContent, setLastAudioContent] = useState<string | null>(null);
  const [lastSpokenText, setLastSpokenText] = useState<string>("");

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

  const handleSpeak = async (text: string, voiceOverride?: string, ssml?: string) => {
    if (!text.trim() || !accessToken || !selectedVoice) return;
    
    setIsSpeaking(true);
    setSessionStatus("processing");

    // Store whether we should restart listening after speaking
    if (currentMode === 'stt' && isListening) {
      setShouldRestartListening(true);
    }

    try {
      const ttsService = new GoogleTTSService(accessToken);
      const voiceToUse = voiceOverride || selectedVoice;
      
      let response;
      if (ssml) {
        // Extract language code from voice name
        const languageCode = voiceToUse.split('-').slice(0, 2).join('-');
        response = await ttsService.synthesizeSSML(ssml, voiceToUse, languageCode);
      } else {
        // Extract language code from voice name
        const languageCode = voiceToUse.split('-').slice(0, 2).join('-');
        response = await ttsService.synthesize({
          text,
          voiceName: voiceToUse,
          languageCode
        });
      }

      // Store for replay
      setLastAudioContent(response.audioContent);
      setLastSpokenText(text);

      // Play audio
      await playAudioFromBase64(response.audioContent);

      setCurrentLatency(response.latency);
      addLogEntry('tts', text, voiceToUse, response.latency);
    } catch (error) {
      console.error("Failed to synthesize text:", error);
      addLogEntry('error', `Failed to speak: ${error}`, undefined, 0);
    } finally {
      setIsSpeaking(false);
      setSessionStatus("idle");
    }
  };

  const handleReplay = async () => {
    if (!lastAudioContent) return;
    
    setIsSpeaking(true);
    try {
      await playAudioFromBase64(lastAudioContent);
      addLogEntry('replay', lastSpokenText, 'Replay', 0);
    } catch (error) {
      console.error("Failed to replay audio:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Auto-restart listening after speaking completes
  useEffect(() => {
    const restartListening = async () => {
      if (shouldRestartListening && !isSpeaking && currentMode === 'stt') {
        setShouldRestartListening(false);
        try {
          if (window.electronAPI?.startStreaming) {
            await window.electronAPI.startStreaming({ voiceName: selectedVoice });
          }
          setIsListening(true);
          setSessionStatus("listening");
        } catch (error) {
          console.error("Failed to restart listening:", error);
          setIsListening(false);
          setSessionStatus("idle");
        }
      }
    };

    if (!isSpeaking && shouldRestartListening) {
      const timer = setTimeout(restartListening, 100);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, shouldRestartListening, currentMode, selectedVoice]);

  const handleEmotionTrigger = async (emotionId: string) => {
    const emotion = emotionSounds.find(e => e.id === emotionId);
    if (!emotion) return;

    if (emotion.type === 'tts') {
      const ssml = generateSSML(emotion.content, emotionId);
      await handleSpeak(emotion.content, undefined, ssml);
    } else {
      // Audio file playback - fallback for non-authenticated users
      if (window.electronAPI?.playEmotionSound) {
        await window.electronAPI.playEmotionSound(emotionId);
      }
    }
  };

  const handleCreateCustomEmotion = async (newEmotion: Omit<EmotionSound, 'id'>) => {
    const id = `custom_${Date.now()}`;
    const emotion: EmotionSound = { ...newEmotion, id };
    
    setEmotionSounds(prev => [...prev, emotion]);
    
    // Test the new emotion immediately with SSML
    if (emotion.type === 'tts') {
      const ssml = generateSSML(emotion.content, id);
      await handleSpeak(emotion.content, undefined, ssml);
    }
  };

  const handleToggleListening = async () => {
    // STT functionality would require additional setup
    // For now, this is a placeholder for the existing interface
    console.log("STT functionality requires additional implementation");
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
  }, [emotionSounds, accessToken, selectedVoice]);

  const isProcessing = sessionStatus === "processing" || isSpeaking;
  const canSpeak = accessToken && selectedVoice && !isProcessing;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative">
      <LatencyIndicator currentLatency={currentLatency} />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Logo, Status, and Google Login */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">EVC</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Exposure Voice Console</h1>
              <p className="text-sm text-gray-400">
                Voice: {selectedVoice || 'None selected'} • Mode: {currentMode.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {lastAudioContent && (
              <Button
                onClick={handleReplay}
                disabled={isSpeaking}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Replay
              </Button>
            )}
            <div className="text-right">
              <p className="text-xs text-gray-500">Google Cloud TTS Integration</p>
              <SessionStatus status={sessionStatus} />
            </div>
            <GoogleLogin />
          </div>
        </div>

        {!user && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 text-center">
            <p className="text-blue-300">Please login with Google to access Text-to-Speech functionality</p>
          </div>
        )}

        {/* Mode Selector - Full Width */}
        <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />

        {/* Main 3-Panel Layout */}
        <div className="grid grid-cols-12 gap-6 min-h-[600px]">
          {/* Left Panel - Emotion Board */}
          <div className="col-span-4 space-y-6">
            <EmotionBoard
              emotions={emotionSounds}
              onEmotionTrigger={handleEmotionTrigger}
              disabled={!canSpeak}
            />
            
            <CustomEmotionCreator
              onCreateEmotion={handleCreateCustomEmotion}
              disabled={!canSpeak}
            />
          </div>

          {/* Center Panel - Text Input and Session Log */}
          <div className="col-span-4 space-y-6">
            {(currentMode === 'text' || currentMode === 'stt') && (
              <TextToSpeak
                onSpeak={handleSpeak}
                disabled={!canSpeak}
                isSpeaking={isSpeaking}
              />
            )}

            {currentMode === 'stt' && (
              <SpeechToSpeechToggle
                isListening={isListening}
                onToggle={handleToggleListening}
                disabled={!canSpeak}
              />
            )}

            <SessionLog entries={sessionLog} />
          </div>

          {/* Right Panel - Voice Selector and Advanced Features */}
          <div className="col-span-4 space-y-6">
            <VoiceSelector
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              disabled={isProcessing}
            />

            <StreamDeckIntegration
              emotions={emotionSounds}
              onTriggerEmotion={handleEmotionTrigger}
              disabled={!canSpeak}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceConsole;
