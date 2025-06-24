
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const GoogleLogin = () => {
  const { user, isLoading, error, login, logout } = useGoogleAuth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <img 
            src={user.picture} 
            alt={user.name}
            className="w-8 h-8 rounded-full border-2 border-gray-600"
          />
          <div className="text-sm">
            <div className="text-white font-medium">{user.name}</div>
            <div className="text-gray-400 text-xs">{user.email}</div>
          </div>
        </div>
        <Button
          onClick={logout}
          size="sm"
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={login}
        className="bg-blue-600 hover:bg-blue-700 text-white"
        disabled={isLoading}
      >
        <LogIn className="w-4 h-4 mr-2" />
        Login with Google
      </Button>
      {error && (
        <div className="text-red-400 text-xs">{error}</div>
      )}
    </div>
  );
};

export default GoogleLogin;
