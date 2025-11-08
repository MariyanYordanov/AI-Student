import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  register: (email: string, name: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  register: async (email: string, name: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.auth.register(email, name, password);
      // DO NOT login user automatically after registration
      // User must verify email first before they can login
      // Just clear loading state and let the register component show the verification message
      set({ isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Грешка при регистрация';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.auth.login(email, password);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      set({ user: response.user, token: response.token, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Грешка при логин';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  restoreSession: async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    console.log('[DEBUG] restoreSession: token =', token ? 'exists' : 'null');
    console.log('[DEBUG] restoreSession: userStr =', userStr);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('[DEBUG] restoreSession: Parsed user =', user);

        // Clean up user object - remove token field if present (old format)
        if (user.token) {
          console.log('[DEBUG] restoreSession: Removing invalid token field from user object');
          delete user.token;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Validate required fields
        if (!user.id || !user.email) {
          console.log('[DEBUG] restoreSession: User object missing required fields (id, email)');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }

        set({ user, token });
        console.log('[DEBUG] restoreSession: Set authStore with user');
      } catch (error) {
        console.log('[DEBUG] restoreSession: Parse error =', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('[DEBUG] restoreSession: No token or userStr in localStorage');
    }
  },

  clearError: () => set({ error: null }),
}));
