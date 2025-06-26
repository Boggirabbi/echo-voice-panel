
import { useState, useEffect } from 'react';
import { GoogleUser, AuthState } from '@/types/auth';
import { GoogleOAuthService } from '@/services/googleOAuth';
import { AuthStorageService } from '@/services/authStorage';

export const useGoogleAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    error: null
  });

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const { token, user } = AuthStorageService.getStoredAuth();
        
        setAuthState({
          user,
          accessToken: token,
          isLoading: false,
          error: null
        });

        // Handle OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: `Authentication failed: ${error}`
          }));
          // Clear URL params
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        if (code) {
          handleOAuthCallback(code);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize authentication'
        }));
      }
    };

    initializeAuth();
  }, []);

  const handleOAuthCallback = async (code: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { accessToken, user } = await GoogleOAuthService.exchangeCodeForToken(code);
      
      setAuthState({
        user,
        accessToken,
        isLoading: false,
        error: null
      });

      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('OAuth callback error:', error);
      setAuthState({
        user: null,
        accessToken: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      });
      
      // Clear URL params even on error
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await GoogleOAuthService.initiateLogin();
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
    }
  };

  const logout = () => {
    AuthStorageService.clearAuth();
    setAuthState({
      user: null,
      accessToken: null,
      isLoading: false,
      error: null
    });
  };

  return {
    user: authState.user,
    accessToken: authState.accessToken,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    logout
  };
};
