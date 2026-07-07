import { create } from 'zustand';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_admin?: boolean;
  is_suspended?: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sb_auth_token', token);
      localStorage.setItem('sb_auth_user', JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb_auth_token');
      localStorage.removeItem('sb_auth_user');
    }
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },
  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sb_auth_token');
      const userStr = localStorage.getItem('sb_auth_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ token, user, isAuthenticated: true, isLoading: false });
          return;
        } catch (e) {
          localStorage.removeItem('sb_auth_token');
          localStorage.removeItem('sb_auth_user');
        }
      }
    }
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },
}));

// Theme configurations handled via next-themes provider directly.

export interface OfflineState {
  isOffline: boolean;
  setIsOffline: (isOffline: boolean) => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOffline: false,
  setIsOffline: (isOffline) => {
    if (typeof window !== 'undefined') {
      (window as any).__OFFLINE_MODE__ = isOffline;
    }
    set({ isOffline });
  },
}));
