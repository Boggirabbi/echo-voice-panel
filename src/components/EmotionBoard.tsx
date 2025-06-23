
import { Button } from "@/components/ui/button";
import { EmotionSound } from "@/types/electron";

interface EmotionBoardProps {
  emotions: EmotionSound[];
  onEmotionTrigger: (emotionId: string) => Promise<void>;
  disabled: boolean;
}

const EmotionBoard = ({ emotions, onEmotionTrigger, disabled }: EmotionBoardProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Emotion Board
      </label>
      <div className="grid grid-cols-3 gap-2 p-4 bg-gray-800 rounded-lg border border-gray-700">
        {emotions.map((emotion) => (
          <Button
            key={emotion.id}
            onClick={() => onEmotionTrigger(emotion.id)}
            disabled={disabled}
            className="h-16 flex flex-col items-center justify-center space-y-1 bg-gray-700 hover:bg-gray-600 focus:ring-2 focus:ring-purple-500 transition-all duration-150"
          >
            <div className="font-semibold text-sm">{emotion.name}</div>
            <div className="text-xs text-gray-400 font-mono">
              {emotion.hotkey}
            </div>
          </Button>
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center">
        Click buttons or use keyboard shortcuts for instant emotional responses
      </p>
    </div>
  );
};

export default EmotionBoard;
