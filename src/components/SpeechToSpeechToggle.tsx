
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
        className={`w-full py-4 text-lg font-semibold transition-all duration-200 relative overflow-hidden ${
          isListening
            ? "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 shadow-lg shadow-red-500/30"
            : "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
        }`}
      >
        {isListening && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-red-400/40 to-red-500/20 animate-pulse" />
        )}
        <div className="relative z-10 flex items-center justify-center">
          {isListening ? (
            <>
              <MicOff className="w-6 h-6 mr-3" />
              Stop Listening
              <div className="ml-3 flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-white rounded-full animate-pulse"
                    style={{
                      height: '16px',
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <Mic className="w-6 h-6 mr-3" />
              Start Listening
            </>
          )}
        </div>
      </Button>
    </div>
  );
};

export default SpeechToSpeechToggle;
