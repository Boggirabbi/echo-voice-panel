
import { Button } from "@/components/ui/button";

type AppMode = 'text' | 'stt' | 'emotion';

interface ModeSelectorProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const ModeSelector = ({ currentMode, onModeChange }: ModeSelectorProps) => {
  const modes = [
    { id: 'text' as AppMode, label: 'TEXT MODE', description: 'Type to speak', color: 'blue' },
    { id: 'stt' as AppMode, label: 'STT MODE', description: 'Speech to speech', color: 'green' },
    { id: 'emotion' as AppMode, label: 'SILENT EMOTION', description: 'Emotion sounds only', color: 'purple' }
  ];

  const getGlowClass = (mode: typeof modes[0]) => {
    if (currentMode === mode.id) {
      switch (mode.color) {
        case 'blue': return 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-400 shadow-lg shadow-blue-500/50 glow-blue';
        case 'green': return 'bg-green-600 hover:bg-green-700 ring-2 ring-green-400 shadow-lg shadow-green-500/50 glow-green';
        case 'purple': return 'bg-purple-600 hover:bg-purple-700 ring-2 ring-purple-400 shadow-lg shadow-purple-500/50 glow-purple';
        default: return 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-400 shadow-lg shadow-blue-500/50';
      }
    }
    return 'bg-gray-700 hover:bg-gray-600 text-gray-300';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Mode Selection
      </label>
      <div className="flex space-x-1 p-1 bg-gray-800 rounded-full border border-gray-700">
        {modes.map((mode) => (
          <Button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex-1 h-12 rounded-full text-sm font-semibold transition-all duration-300 ${getGlowClass(mode)}`}
          >
            <div className="text-center">
              <div className="font-bold">{mode.label}</div>
              <div className="text-xs opacity-75">{mode.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;
