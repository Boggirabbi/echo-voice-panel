
import { useState, useEffect } from "react";

interface LatencyIndicatorProps {
  currentLatency?: number;
}

const LatencyIndicator = ({ currentLatency }: LatencyIndicatorProps) => {
  const [avgLatency, setAvgLatency] = useState<number>(0);

  useEffect(() => {
    const fetchLatencyStats = async () => {
      try {
        if (window.electronAPI?.getLatencyStats) {
          const stats = await window.electronAPI.getLatencyStats();
          setAvgLatency(stats.avgLatency);
        }
      } catch (error) {
        console.error("Failed to fetch latency stats:", error);
      }
    };

    const interval = setInterval(fetchLatencyStats, 2000);
    fetchLatencyStats();

    return () => clearInterval(interval);
  }, []);

  const getLatencyColor = (latency: number) => {
    if (latency < 200) return "text-green-400";
    if (latency < 500) return "text-yellow-400";
    return "text-red-400";
  };

  const displayLatency = currentLatency || avgLatency;

  return (
    <div className="fixed top-4 right-4 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-gray-400">Latency:</span>
        <span className={getLatencyColor(displayLatency)}>
          {displayLatency.toFixed(0)}ms
        </span>
      </div>
    </div>
  );
};

export default LatencyIndicator;
