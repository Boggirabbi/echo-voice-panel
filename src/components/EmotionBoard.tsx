
import { Button } from "@/components/ui/button";
import { EmotionSound } from "@/types/electron";

interface EmotionBoardProps {
  emotions: EmotionSound[];
  onEmotionTrigger: (emotionId: string) => Promise<void>;
  disabled: boolean;
}

const EmotionBoard = ({ emotions, onEmotionTrigger, disabled }: EmotionBoardProps) => {
  const getEmotionColor = (emotionId: string) => {
    if (emotionId.includes('tease') || emotionId.includes('encourage')) return 'bg-pink-700 hover:bg-pink-600';
    if (emotionId.includes('moan') || emotionId.includes('whisper') || emotionId.includes('affirmation')) return 'bg-purple-700 hover:bg-purple-600';
    if (emotionId.includes('sigh') || emotionId.includes('calm')) return 'bg-blue-700 hover:bg-blue-600';
    if (emotionId.includes('humiliation') || emotionId.includes('mock')) return 'bg-yellow-700 hover:bg-yellow-600';
    if (emotionId.includes('laugh') || emotionId.includes('gasp')) return 'bg-green-700 hover:bg-green-600';
    return 'bg-gray-700 hover:bg-gray-600'; // default
  };

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
            className={`h-16 flex flex-col items-center justify-center space-y-1 ${getEmotionColor(emotion.id)} focus:ring-2 focus:ring-purple-500 transition-all duration-150`}
          >
            <div className="font-semibold text-sm text-white">{emotion.name}</div>
            <div className="text-xs text-gray-300 font-mono">
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
