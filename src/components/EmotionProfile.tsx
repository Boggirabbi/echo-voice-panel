
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmotionProfile } from "@/types/electron";

interface EmotionProfileSelectorProps {
  profiles: EmotionProfile[];
  selectedProfile: string;
  onProfileChange: (profileId: string) => void;
}

const EmotionProfileSelector = ({ profiles, selectedProfile, onProfileChange }: EmotionProfileSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Emotion Profile
      </label>
      <Select value={selectedProfile} onValueChange={onProfileChange}>
        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-750 focus:ring-2 focus:ring-blue-500">
          <SelectValue placeholder="Select emotion profile" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700 text-white z-50">
          {profiles.map((profile) => (
            <SelectItem 
              key={profile.id} 
              value={profile.id}
              className="focus:bg-gray-700 focus:text-white hover:bg-gray-700"
            >
              <div>
                <div className="font-medium">{profile.name}</div>
                <div className="text-xs text-gray-400">
                  Speed: {profile.speed}x | Pitch: {profile.pitch > 0 ? '+' : ''}{profile.pitch}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EmotionProfileSelector;
