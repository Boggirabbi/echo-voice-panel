
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface TextToSpeakProps {
  onSpeak: (text: string, command?: string) => Promise<void>;
  disabled: boolean;
  isSpeaking: boolean;
}

const TextToSpeak = ({ onSpeak, disabled, isSpeaking }: TextToSpeakProps) => {
  const [text, setText] = useState("");
  const [recentPhrases, setRecentPhrases] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseSlashCommand = (input: string) => {
    const match = input.match(/^\/(\w+)\s+(.+)$/);
    if (match) {
      return { command: match[1], text: match[2] };
    }
    return { command: undefined, text: input };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled || isSpeaking) return;
    
    const { command, text: cleanText } = parseSlashCommand(text);
    
    try {
      await onSpeak(cleanText, command);
      
      // Add to recent phrases
      setRecentPhrases(prev => [cleanText, ...prev.slice(0, 2)]);
      setText("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to speak:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Text to Speak {isSpeaking && <span className="text-blue-400 animate-pulse">● Speaking...</span>}
        </label>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type message or use slash commands (/tease, /calm)..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            disabled={disabled || isSpeaking}
          />
          <Button
            type="submit"
            size="lg"
            disabled={!text.trim() || disabled || isSpeaking}
            className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 px-6"
          >
            {isSpeaking ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-500">Press Enter to speak instantly | Use /command for emotion modes</p>
      </div>

      {recentPhrases.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-400">Recent Phrases</label>
          <div className="space-y-1">
            {recentPhrases.map((phrase, index) => (
              <div
                key={index}
                className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => setText(phrase)}
              >
                {phrase}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextToSpeak;
