
export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface AuthState {
  user: GoogleUser | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}
