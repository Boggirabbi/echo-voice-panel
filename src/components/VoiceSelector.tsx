
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Voice {
  name: string;
  languageCode: string;
  gender: string;
}

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoice: string;
  onVoiceChange: (voiceName: string) => void;
}

const VoiceSelector = ({ voices, selectedVoice, onVoiceChange }: VoiceSelectorProps) => {
  const formatVoiceName = (voice: Voice) => {
    const parts = voice.name.split("-");
    const language = parts[0] || "en";
    const region = parts[1] || "US";
    const type = parts[2] || "Standard";
    const variant = parts[3] || "A";
    return `${language.toUpperCase()}-${region} ${type} ${variant} (${voice.gender})`;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Voice Selection
      </label>
      <Select value={selectedVoice} onValueChange={onVoiceChange}>
        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-750 focus:ring-2 focus:ring-blue-500">
          <SelectValue placeholder="Select a voice" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700 text-white z-50">
          {voices.map((voice) => (
            <SelectItem 
              key={voice.name} 
              value={voice.name}
              className="focus:bg-gray-700 focus:text-white hover:bg-gray-700"
            >
              {formatVoiceName(voice)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VoiceSelector;
