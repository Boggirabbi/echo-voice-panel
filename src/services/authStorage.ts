
import { GoogleUser } from '@/types/auth';

export class AuthStorageService {
  private static readonly TOKENS = {
    ACCESS_TOKEN: 'google_access_token',
    USER: 'google_user'
  };

  static getStoredAuth(): { token: string | null; user: GoogleUser | null } {
    const token = localStorage.getItem(this.TOKENS.ACCESS_TOKEN);
    const userString = localStorage.getItem(this.TOKENS.USER);
    
    let user: GoogleUser | null = null;
    if (userString) {
      try {
        user = JSON.parse(userString);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuth();
      }
    }
    
    return { token, user };
  }

  static storeAuth(accessToken: string, user: GoogleUser): void {
    localStorage.setItem(this.TOKENS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(this.TOKENS.USER, JSON.stringify(user));
  }

  static clearAuth(): void {
    localStorage.removeItem(this.TOKENS.ACCESS_TOKEN);
    localStorage.removeItem(this.TOKENS.USER);
  }
}
