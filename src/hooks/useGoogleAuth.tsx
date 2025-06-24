
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthState {
  user: GoogleUser | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useGoogleAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Check for stored auth on load
    const storedToken = localStorage.getItem('google_access_token');
    const storedUser = localStorage.getItem('google_user');
    
    if (storedToken && storedUser) {
      setAuthState({
        user: JSON.parse(storedUser),
        accessToken: storedToken,
        isLoading: false,
        error: null
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }

    // Handle OAuth redirect
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        try {
          await exchangeCodeForToken(code);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('OAuth callback error:', error);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const getClientId = async (): Promise<string> => {
    const { data } = await supabase.functions.invoke('get-google-client-id');
    return data.clientId;
  };

  const login = async () => {
    try {
      const clientId = await getClientId();
      const redirectUri = window.location.origin;
      const scope = 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
      
      const authUrl = `https://accounts.google.com/oauth2/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline`;

      window.location.href = authUrl;
    } catch (error) {
      setAuthState(prev => ({ ...prev, error: 'Failed to initiate login' }));
    }
  };

  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await supabase.functions.invoke('google-oauth-exchange', {
        body: { code, redirectUri: window.location.origin }
      });

      if (response.error) throw new Error(response.error.message);

      const { access_token, user_info } = response.data;
      
      localStorage.setItem('google_access_token', access_token);
      localStorage.setItem('google_user', JSON.stringify(user_info));
      
      setAuthState({
        user: user_info,
        accessToken: access_token,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, error: 'Failed to exchange code for token', isLoading: false }));
    }
  };

  const logout = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_user');
    setAuthState({
      user: null,
      accessToken: null,
      isLoading: false,
      error: null
    });
  };

  return {
    ...authState,
    login,
    logout
  };
};
