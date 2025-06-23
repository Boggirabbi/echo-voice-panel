
interface SessionStatusProps {
  status: "idle" | "listening" | "processing";
}

const SessionStatus = ({ status }: SessionStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "listening":
        return {
          text: "Listening...",
          bgColor: "bg-green-900/30",
          borderColor: "border-green-500",
          textColor: "text-green-400",
          pulseColor: "bg-green-500"
        };
      case "processing":
        return {
          text: "Processing...",
          bgColor: "bg-blue-900/30",
          borderColor: "border-blue-500",
          textColor: "text-blue-400",
          pulseColor: "bg-blue-500"
        };
      default:
        return {
          text: "Idle",
          bgColor: "bg-gray-800",
          borderColor: "border-gray-600",
          textColor: "text-gray-400",
          pulseColor: "bg-gray-500"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Session Status
      </label>
      <div className={`p-4 rounded-lg border-2 ${config.bgColor} ${config.borderColor} transition-all duration-300`}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${config.pulseColor}`} />
            {status !== "idle" && (
              <div className={`absolute inset-0 w-3 h-3 rounded-full ${config.pulseColor} animate-ping opacity-75`} />
            )}
          </div>
          <span className={`font-medium ${config.textColor}`}>
            {config.text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionStatus;
