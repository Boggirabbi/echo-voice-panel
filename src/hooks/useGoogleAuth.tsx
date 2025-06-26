
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
      try {
        setAuthState({
          user: JSON.parse(storedUser),
          accessToken: storedToken,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }

    // Handle OAuth redirect
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.Get('code');
      const error = urlParams.get('error');
      
      if (error) {
        console.error('OAuth error:', error);
        setAuthState(prev => ({ ...prev, error: `OAuth error: ${error}`, isLoading: false }));
        return;
      }
      
      if (code) {
        console.log('OAuth code received, exchanging for token...');
        try {
          await exchangeCodeForToken(code);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('OAuth callback error:', error);
          setAuthState(prev => ({ ...prev, error: 'Failed to complete authentication', isLoading: false }));
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const getClientId = async (): Promise<string> => {
    try {
      console.log('Fetching Google Client ID...');
      const { data, error } = await supabase.functions.invoke('get-google-client-id');
      
      if (error) {
        console.error('Error fetching client ID:', error);
        throw new Error('Failed to get Google Client ID');
      }
      
      if (!data?.clientId) {
        throw new Error('No client ID returned from server');
      }
      
      console.log('Client ID fetched successfully');
      return data.clientId;
    } catch (error) {
      console.error('getClientId error:', error);
      throw error;
    }
  };

  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const clientId = await getClientId();
      const redirectUri = window.location.origin;
      const scope = 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
      
      const authUrl = `https://accounts.google.com/oauth2/authorize?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      console.log('Redirecting to Google OAuth...');
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        error: `Failed to initiate login: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isLoading: false 
      }));
    }
  };

  const exchangeCodeForToken = async (code: string) => {
    try {
      console.log('Exchanging code for token...');
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await supabase.functions.invoke('google-oauth-exchange', {
        body: { 
          code, 
          redirectUri: window.location.origin 
        }
      });

      console.log('OAuth exchange response:', response);

      if (response.error) {
        console.error('OAuth exchange error:', response.error);
        throw new Error(response.error.message || 'OAuth exchange failed');
      }

      if (!response.data) {
        throw new Error('No data returned from OAuth exchange');
      }

      const { access_token, user_info } = response.data;
      
      if (!access_token || !user_info) {
        throw new Error('Invalid response from OAuth exchange');
      }
      
      localStorage.setItem('google_access_token', access_token);
      localStorage.setItem('google_user', JSON.stringify(user_info));
      
      setAuthState({
        user: user_info,
        accessToken: access_token,
        isLoading: false,
        error: null
      });
      
      console.log('Authentication successful');
    } catch (error) {
      console.error('Exchange token error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        error: `Failed to complete authentication: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        isLoading: false 
      }));
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
    console.log('User logged out');
  };

  return {
    ...authState,
    login,
    logout
  };
};
