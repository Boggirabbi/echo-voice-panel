
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmotionSound } from "@/types/electron";
import { Plus, X } from "lucide-react";

interface CustomEmotionCreatorProps {
  onCreateEmotion: (emotion: Omit<EmotionSound, 'id'>) => Promise<void>;
  disabled: boolean;
}

const CustomEmotionCreator = ({ onCreateEmotion, disabled }: CustomEmotionCreatorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [emotionTag, setEmotionTag] = useState("");
  const [hotkey, setHotkey] = useState("");

  const emotionTags = [
    'laugh', 'gasp', 'encourage', 'tease', 'moan', 'whisper', 'affirmation', 'humiliation'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    try {
      await onCreateEmotion({
        name: name.trim(),
        content: content.trim(),
        hotkey: hotkey.trim() || `F${Math.floor(Math.random() * 12) + 1}`,
        type: 'tts'
      });

      // Reset form
      setName("");
      setContent("");
      setEmotionTag("");
      setHotkey("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create custom emotion:", error);
    }
  };

  if (!isOpen) {
    return (
      <div className="space-y-2">
        <Button
          onClick={() => setIsOpen(true)}
          disabled={disabled}
          className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Emotion
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Create Custom Emotion</h3>
        <Button
          onClick={() => setIsOpen(false)}
          size="sm"
          className="bg-gray-700 hover:bg-gray-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Button Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Sultry Laugh"
            className="bg-gray-700 border-gray-600 text-white"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Phrase to Speak
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g., *laughs seductively* You're so cute when you try..."
            className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Emotion Tag
            </label>
            <Select value={emotionTag} onValueChange={setEmotionTag}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Choose tag" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {emotionTags.map((tag) => (
                  <SelectItem key={tag} value={tag} className="text-white focus:bg-gray-600">
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Hotkey (Optional)
            </label>
            <Input
              value={hotkey}
              onChange={(e) => setHotkey(e.target.value)}
              placeholder="F7, Ctrl+1, etc."
              className="bg-gray-700 border-gray-600 text-white"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            type="submit"
            disabled={!name.trim() || !content.trim() || disabled}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Create & Add to Board
          </Button>
          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomEmotionCreator;
