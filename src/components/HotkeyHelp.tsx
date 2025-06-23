
const HotkeyHelp = () => {
  const hotkeys = [
    { key: "F1", action: "Laugh", description: "Trigger laugh sound" },
    { key: "F2", action: "Gasp", description: "Trigger gasp sound" },
    { key: "F3", action: "Sigh", description: "Trigger sigh sound" },
    { key: "F4", action: "Hmm", description: "Trigger thinking sound" },
    { key: "F5", action: "Wow", description: "Trigger amazement sound" },
    { key: "F6", action: "Oops", description: "Trigger mistake sound" },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Emotion Sound Hotkeys
      </label>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {hotkeys.map((hotkey) => (
            <div key={hotkey.key} className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <kbd className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-mono">
                  {hotkey.key}
                </kbd>
                <span className="text-sm font-medium text-white">{hotkey.action}</span>
              </div>
              <span className="text-xs text-gray-400 hidden sm:block">{hotkey.description}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Press these keys during sessions for instant emotional responses
          </p>
        </div>
      </div>
    </div>
  );
};

export default HotkeyHelp;
