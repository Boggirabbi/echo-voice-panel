
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface SpeechToSpeechToggleProps {
  isListening: boolean;
  onToggle: () => Promise<void>;
  disabled: boolean;
}

const SpeechToSpeechToggle = ({ isListening, onToggle, disabled }: SpeechToSpeechToggleProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Speech-to-Speech Mode
      </label>
      <Button
        onClick={onToggle}
        disabled={disabled}
        size="lg"
        className={`w-full py-4 text-lg font-semibold transition-all duration-200 ${
          isListening
            ? "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
            : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-6 h-6 mr-3" />
            Stop Listening
          </>
        ) : (
          <>
            <Mic className="w-6 h-6 mr-3" />
            Start Listening
          </>
        )}
      </Button>
    </div>
  );
};

export default SpeechToSpeechToggle;
