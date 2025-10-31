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
      const response = await api.auth.register(email, name, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      set({ user: response, token: response.token, isLoading: false });
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
      localStorage.setItem('user', JSON.stringify(response));
      set({ user: response, token: response.token, isLoading: false });
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

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  clearError: () => set({ error: null }),
}));
