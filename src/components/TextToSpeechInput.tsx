
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface TextToSpeechInputProps {
  onSynthesize: (text: string) => Promise<void>;
  disabled: boolean;
}

const TextToSpeechInput = ({ onSynthesize, disabled }: TextToSpeechInputProps) => {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled || isSending) return;
    
    setIsSending(true);
    try {
      await onSynthesize(text);
      setText("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Text to Speech
      </label>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type message to speak instantly..."
          className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          disabled={disabled || isSending}
        />
        <Button
          type="submit"
          size="lg"
          disabled={!text.trim() || disabled || isSending}
          className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 px-6"
        >
          {isSending ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
      <p className="text-xs text-gray-500">Press Enter to speak instantly</p>
    </div>
  );
};

export default TextToSpeechInput;
