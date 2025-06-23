
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmotionSound } from "@/types/electron";
import { Gamepad2, Wifi, WifiOff, RotateCcw } from "lucide-react";

interface StreamDeckIntegrationProps {
  emotions: EmotionSound[];
  onTriggerEmotion: (emotionId: string) => Promise<void>;
  disabled: boolean;
}

interface StreamDeckButton {
  id: number;
  emotionId?: string;
  label: string;
  isActive: boolean;
}

const StreamDeckIntegration = ({ emotions, onTriggerEmotion, disabled }: StreamDeckIntegrationProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [buttons, setButtons] = useState<StreamDeckButton[]>(() => 
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      label: `Button ${i + 1}`,
      isActive: false
    }))
  );

  const handleConnect = async () => {
    try {
      // Simulate Stream Deck connection - replace with actual IPC call
      if (window.electronAPI?.connectStreamDeck) {
        await window.electronAPI.connectStreamDeck();
      }
      setIsConnected(true);
      console.log("Stream Deck connected");
    } catch (error) {
      console.error("Failed to connect Stream Deck:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (window.electronAPI?.disconnectStreamDeck) {
        await window.electronAPI.disconnectStreamDeck();
      }
      setIsConnected(false);
      console.log("Stream Deck disconnected");
    } catch (error) {
      console.error("Failed to disconnect Stream Deck:", error);
    }
  };

  const handleButtonAssign = (buttonId: number, emotionId: string) => {
    const emotion = emotions.find(e => e.id === emotionId);
    if (!emotion) return;

    setButtons(prev => prev.map(btn => 
      btn.id === buttonId 
        ? { ...btn, emotionId, label: emotion.name, isActive: true }
        : btn
    ));

    // Send mapping to backend
    if (window.electronAPI?.mapStreamDeckButton) {
      window.electronAPI.mapStreamDeckButton({
        buttonId,
        emotionId,
        label: emotion.name
      });
    }
  };

  const handleReloadMappings = async () => {
    try {
      if (window.electronAPI?.reloadStreamDeckMappings) {
        await window.electronAPI.reloadStreamDeckMappings();
      }
      console.log("Stream Deck mappings reloaded");
    } catch (error) {
      console.error("Failed to reload mappings:", error);
    }
  };

  // Listen for Stream Deck button presses
  useEffect(() => {
    if (!isConnected) return;

    const handleStreamDeckPress = (event: any) => {
      const { buttonId } = event.detail;
      const button = buttons.find(b => b.id === buttonId);
      if (button?.emotionId) {
        onTriggerEmotion(button.emotionId);
      }
    };

    window.addEventListener('streamdeck-press', handleStreamDeckPress);
    return () => window.removeEventListener('streamdeck-press', handleStreamDeckPress);
  }, [isConnected, buttons, onTriggerEmotion]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center space-x-3">
          <Gamepad2 className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="font-semibold text-white">Stream Deck XL</h3>
            <p className="text-sm text-gray-400">
              Status: {isConnected ? 
                <span className="text-green-400 flex items-center"><Wifi className="w-3 h-3 mr-1" />Connected</span> : 
                <span className="text-red-400 flex items-center"><WifiOff className="w-3 h-3 mr-1" />Disconnected</span>
              }
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleReloadMappings}
            disabled={!isConnected || disabled}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reload
          </Button>
          <Button
            onClick={isConnected ? handleDisconnect : handleConnect}
            disabled={disabled}
            size="sm"
            className={isConnected ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isConnected ? "Disconnect" : "Connect"}
          </Button>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="sm"
            className="bg-gray-600 hover:bg-gray-700"
          >
            {isExpanded ? "Hide" : "Configure"}
          </Button>
        </div>
      </div>

      {isExpanded && isConnected && (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Button Mapping (32 Buttons)</h4>
          <div className="grid grid-cols-8 gap-2 max-h-96 overflow-y-auto">
            {buttons.map((button) => (
              <div key={button.id} className="space-y-2">
                <div className={`w-full h-12 rounded border-2 flex items-center justify-center text-xs font-mono ${
                  button.isActive 
                    ? "border-green-500 bg-green-900/20 text-green-300" 
                    : "border-gray-600 bg-gray-700 text-gray-400"
                }`}>
                  {button.id + 1}
                </div>
                <Select
                  value={button.emotionId || ""}
                  onValueChange={(emotionId) => handleButtonAssign(button.id, emotionId)}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Assign" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="" className="text-gray-400">Clear</SelectItem>
                    {emotions.map((emotion) => (
                      <SelectItem key={emotion.id} value={emotion.id} className="text-white text-xs">
                        {emotion.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamDeckIntegration;
