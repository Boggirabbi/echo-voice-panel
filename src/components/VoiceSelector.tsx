
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoogleVoice, GoogleTTSService } from "@/services/googleTTS";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceName: string) => void;
  disabled?: boolean;
}

const VoiceSelector = ({ selectedVoice, onVoiceChange, disabled }: VoiceSelectorProps) => {
  const [voices, setVoices] = useState<GoogleVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken } = useGoogleAuth();

  useEffect(() => {
    const fetchVoices = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const ttsService = new GoogleTTSService(accessToken);
        const availableVoices = await ttsService.getVoices();
        
        // Filter for English voices and sort by quality
        const englishVoices = availableVoices
          .filter(voice => voice.languageCodes.some(code => code.startsWith('en-')))
          .sort((a, b) => {
            // Prioritize Studio > Wavenet > Standard
            const aScore = a.name.includes('Studio') ? 3 : a.name.includes('Wavenet') ? 2 : 1;
            const bScore = b.name.includes('Studio') ? 3 : b.name.includes('Wavenet') ? 2 : 1;
            return bScore - aScore;
          });
        
        setVoices(englishVoices);
        
        // Auto-select first voice if none selected
        if (!selectedVoice && englishVoices.length > 0) {
          onVoiceChange(englishVoices[0].name);
        }
      } catch (error) {
        console.error("Failed to fetch voices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoices();
  }, [accessToken, selectedVoice, onVoiceChange]);

  const formatVoiceName = (voice: GoogleVoice) => {
    const parts = voice.name.split("-");
    const language = parts[0] || "en";
    const region = parts[1] || "US";
    const type = parts[2] || "Standard";
    const variant = parts[3] || "A";
    
    return `${language.toUpperCase()}-${region} ${type} ${variant} (${voice.ssmlGender})`;
  };

  const categorizeVoices = () => {
    const studio = voices.filter(v => v.name.includes("Studio"));
    const wavenet = voices.filter(v => v.name.includes("Wavenet"));
    const standard = voices.filter(v => !v.name.includes("Wavenet") && !v.name.includes("Studio"));
    
    return { studio, wavenet, standard };
  };

  if (!accessToken) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Voice Selection
        </label>
        <div className="w-full h-10 bg-gray-800 border border-gray-700 rounded-md flex items-center justify-center">
          <span className="text-gray-400 text-sm">Login required</span>
        </div>
      </div>
    );
  }

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

  const { studio, wavenet, standard } = categorizeVoices();

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
