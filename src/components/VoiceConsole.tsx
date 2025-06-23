
import { useState, useEffect } from "react";
import VoiceSelector from "./VoiceSelector";
import TextToSpeechInput from "./TextToSpeechInput";
import SpeechToSpeechToggle from "./SpeechToSpeechToggle";
import SessionStatus from "./SessionStatus";
import HotkeyHelp from "./HotkeyHelp";

interface Voice {
  name: string;
  languageCode: string;
  gender: string;
}

const VoiceConsole = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<"idle" | "listening" | "processing">("idle");

  useEffect(() => {
    // Load available voices on component mount
    const loadVoices = async () => {
      try {
        if (window.electronAPI?.getVoices) {
          const voiceList = await window.electronAPI.getVoices();
          setVoices(voiceList);
          if (voiceList.length > 0) {
            setSelectedVoice(voiceList[0].name);
          }
        }
      } catch (error) {
        console.error("Failed to load voices:", error);
        // Fallback voices for development
        const fallbackVoices = [
          { name: "en-US-Standard-A", languageCode: "en-US", gender: "FEMALE" },
          { name: "en-US-Standard-B", languageCode: "en-US", gender: "MALE" },
          { name: "en-US-Standard-C", languageCode: "en-US", gender: "FEMALE" },
          { name: "en-US-Standard-D", languageCode: "en-US", gender: "MALE" },
        ];
        setVoices(fallbackVoices);
        setSelectedVoice(fallbackVoices[0].name);
      }
    };

    loadVoices();
  }, []);

  const handleSynthesizeText = async (text: string) => {
    if (!text.trim() || !selectedVoice) return;
    
    try {
      setSessionStatus("processing");
      if (window.electronAPI?.synthesize) {
        await window.electronAPI.synthesize({
          text: text.trim(),
          voiceName: selectedVoice
        });
      } else {
        console.log(`[DEMO] Synthesizing: "${text}" with voice: ${selectedVoice}`);
      }
    } catch (error) {
      console.error("Failed to synthesize text:", error);
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Exposure Voice Console</h1>
          <p className="text-gray-400">Real-time AI Voice Assistant for Therapy Sessions</p>
        </div>

        {/* Main Controls */}
        <div className="space-y-6">
          <VoiceSelector 
            voices={voices}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
          />
          
          <TextToSpeechInput 
            onSynthesize={handleSynthesizeText}
            disabled={sessionStatus === "processing"}
          />
          
          <SpeechToSpeechToggle 
            isListening={isListening}
            onToggle={handleToggleListening}
            disabled={sessionStatus === "processing"}
          />
          
          <SessionStatus status={sessionStatus} />
          
          <HotkeyHelp />
        </div>

        {/* Bottom padding for future session log */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default VoiceConsole;
