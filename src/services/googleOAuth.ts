
import { supabase } from '@/integrations/supabase/client';
import { GoogleUser } from '@/types/auth';
import { AuthStorageService } from './authStorage';

export class GoogleOAuthService {
  static async getClientId(): Promise<string> {
    try {
      console.log('Fetching Google Client ID...');
      const { data, error } = await supabase.functions.invoke('get-google-client-id');
      
      console.log('Client ID response:', { data, error });
      
      if (error) {
        console.error('Error fetching client ID:', error);
        throw new Error(`Failed to get Google Client ID: ${error.message}`);
      }
      
      if (!data?.clientId) {
        console.error('No client ID in response:', data);
        throw new Error('No client ID returned from server');
      }
      
      console.log('Client ID fetched successfully');
      return data.clientId;
    } catch (error) {
      console.error('getClientId error:', error);
      throw error;
    }
  }

  static async initiateLogin(): Promise<void> {
    try {
      const clientId = await this.getClientId();
      const redirectUri = window.location.origin;
      const scope = 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
      
      console.log('=== OAuth Login Debug Info ===');
      console.log('Client ID:', clientId);
      console.log('Redirect URI:', redirectUri);
      console.log('Current URL:', window.location.href);
      console.log('Window origin:', window.location.origin);
      console.log('Location hostname:', window.location.hostname);
      console.log('Location protocol:', window.location.protocol);
      console.log('Location port:', window.location.port);
      
      const authUrl = `https://accounts.google.com/oauth2/authorize?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      console.log('Generated Auth URL:', authUrl);
      console.log('Encoded Redirect URI in URL:', encodeURIComponent(redirectUri));
      console.log('Raw Redirect URI:', redirectUri);
      console.log('Expected current domain:', window.location.origin);
      console.log('Redirecting to Google OAuth...');
      
      // Clear any cached data before redirect
      AuthStorageService.clearAuth();
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async exchangeCodeForToken(code: string): Promise<{ accessToken: string; user: GoogleUser }> {
    try {
      console.log('Exchanging code for token...');
      console.log('Using redirect URI:', window.location.origin);
      
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
        console.error('Invalid OAuth response:', response.data);
        throw new Error('Invalid response from OAuth exchange');
      }
      
      AuthStorageService.storeAuth(access_token, user_info);
      
      console.log('Authentication successful');
      return { accessToken: access_token, user: user_info };
    } catch (error) {
      console.error('Exchange token error:', error);
      throw error;
    }
  }
}
