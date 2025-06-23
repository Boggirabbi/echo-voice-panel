
import { SessionLogEntry } from "@/types/electron";

interface SessionLogProps {
  entries: SessionLogEntry[];
  maxEntries?: number;
}

const SessionLog = ({ entries, maxEntries = 10 }: SessionLogProps) => {
  const displayEntries = entries.slice(0, maxEntries);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tts': return '🗣️';
      case 'stt': return '🎤';
      case 'emotion': return '😊';
      default: return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tts': return 'text-blue-400';
      case 'stt': return 'text-green-400';
      case 'emotion': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          Session Log
        </label>
        <span className="text-xs text-gray-500">
          {entries.length} entries
        </span>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
        {displayEntries.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No session activity yet
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {displayEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start space-x-3 p-2 rounded hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm">{getTypeIcon(entry.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-gray-500">
                      {formatTime(entry.timestamp)}
                    </span>
                    <span className={`font-medium ${getTypeColor(entry.type)}`}>
                      {entry.type.toUpperCase()}
                    </span>
                    {entry.emotion && (
                      <span className="bg-purple-900 text-purple-200 px-1 rounded text-xs">
                        {entry.emotion}
                      </span>
                    )}
                    {entry.latency && (
                      <span className="text-gray-500">
                        {entry.latency}ms
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-white mt-1 truncate">
                    {entry.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionLog;
