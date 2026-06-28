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

export interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sb_theme', theme);
      const root = window.document.documentElement;
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    set({ theme });
  },
  initTheme: () => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('sb_theme') as 'light' | 'dark' | 'system' || 'light';
      get().setTheme(savedTheme);
      
      // Listen for system theme changes if system theme is selected
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        if (get().theme === 'system') {
          get().setTheme('system');
        }
      };
      
      // Compatibility with older browsers
      if (media.addEventListener) {
        media.addEventListener('change', listener);
      } else {
        media.addListener(listener);
      }
    }
  }
}));
