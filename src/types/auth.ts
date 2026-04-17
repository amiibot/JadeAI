export interface AppUser {
  id: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  username?: string | null;
  authType: 'local';
}

export interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
