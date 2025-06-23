
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Voice } from "@/types/electron";

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceName: string) => void;
  disabled?: boolean;
}

const VoiceSelector = ({ selectedVoice, onVoiceChange, disabled }: VoiceSelectorProps) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        if (window.electronAPI?.getVoices) {
          const availableVoices = await window.electronAPI.getVoices();
          setVoices(availableVoices);
        } else {
          // Demo mode - mock Google Cloud voices
          const mockVoices: Voice[] = [
            { name: "en-US-Wavenet-A", languageCode: "en-US", gender: "Female" },
            { name: "en-US-Wavenet-B", languageCode: "en-US", gender: "Male" },
            { name: "en-US-Wavenet-C", languageCode: "en-US", gender: "Female" },
            { name: "en-US-Wavenet-D", languageCode: "en-US", gender: "Male" },
            { name: "en-US-Studio-O", languageCode: "en-US", gender: "Female" },
            { name: "en-US-Studio-Q", languageCode: "en-US", gender: "Male" },
            { name: "en-GB-Wavenet-A", languageCode: "en-GB", gender: "Female" },
            { name: "en-GB-Wavenet-B", languageCode: "en-GB", gender: "Male" },
          ];
          setVoices(mockVoices);
        }
      } catch (error) {
        console.error("Failed to fetch voices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoices();
  }, []);

  const formatVoiceName = (voice: Voice) => {
    const parts = voice.name.split("-");
    const language = parts[0] || "en";
    const region = parts[1] || "US";
    const type = parts[2] || "Standard";
    const variant = parts[3] || "A";
    
    return `${language.toUpperCase()}-${region} ${type} ${variant} (${voice.gender})`;
  };

  const categorizeVoices = () => {
    const wavenet = voices.filter(v => v.name.includes("Wavenet"));
    const studio = voices.filter(v => v.name.includes("Studio"));
    const standard = voices.filter(v => !v.name.includes("Wavenet") && !v.name.includes("Studio"));
    
    return { wavenet, studio, standard };
  };

  const { wavenet, studio, standard } = categorizeVoices();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Voice Selection
        </label>
        <div className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Google Cloud Voice Selection
      </label>
      <Select value={selectedVoice} onValueChange={onVoiceChange} disabled={disabled}>
        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-750 focus:ring-2 focus:ring-blue-500">
          <SelectValue placeholder="Select a Google Cloud voice" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700 text-white z-50 max-h-96">
          {studio.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wide">
                Studio (Premium)
              </div>
              {studio.map((voice) => (
                <SelectItem 
                  key={voice.name} 
                  value={voice.name}
                  className="focus:bg-gray-700 focus:text-white hover:bg-gray-700"
                >
                  {formatVoiceName(voice)}
                </SelectItem>
              ))}
            </>
          )}
          
          {wavenet.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-green-400 uppercase tracking-wide">
                WaveNet (High Quality)
              </div>
              {wavenet.map((voice) => (
                <SelectItem 
                  key={voice.name} 
                  value={voice.name}
                  className="focus:bg-gray-700 focus:text-white hover:bg-gray-700"
                >
                  {formatVoiceName(voice)}
                </SelectItem>
              ))}
            </>
          )}
          
          {standard.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Standard
              </div>
              {standard.map((voice) => (
                <SelectItem 
                  key={voice.name} 
                  value={voice.name}
                  className="focus:bg-gray-700 focus:text-white hover:bg-gray-700"
                >
                  {formatVoiceName(voice)}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500">
        {voices.length} Google Cloud voices available
      </p>
    </div>
  );
};

export default VoiceSelector;
