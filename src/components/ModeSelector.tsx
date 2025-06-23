
import { Button } from "@/components/ui/button";

type AppMode = 'text' | 'stt' | 'emotion';

interface ModeSelectorProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const ModeSelector = ({ currentMode, onModeChange }: ModeSelectorProps) => {
  const modes = [
    { id: 'text' as AppMode, label: 'TEXT MODE', description: 'Type to speak' },
    { id: 'stt' as AppMode, label: 'STT MODE', description: 'Speech to speech' },
    { id: 'emotion' as AppMode, label: 'SILENT EMOTION', description: 'Emotion sounds only' }
  ];

  return (
    <div className="flex space-x-2 mb-6 p-2 bg-gray-800 rounded-lg border border-gray-700">
      {modes.map((mode) => (
        <Button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`flex-1 h-12 text-sm font-semibold transition-all duration-200 ${
            currentMode === mode.id
              ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-400 shadow-lg shadow-blue-500/25"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
          }`}
        >
          <div className="text-center">
            <div className="font-bold">{mode.label}</div>
            <div className="text-xs opacity-75">{mode.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default ModeSelector;
