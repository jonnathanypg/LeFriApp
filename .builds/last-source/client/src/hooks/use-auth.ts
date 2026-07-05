import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDocument } from '@shared/schema';
import { api } from '@/lib/api';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (user: any, token?: string) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<any>) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      
      login: (user, token) => {
        set({ user, isLoading: false });
      },
      
      logout: async () => {
        try {
          await api.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null, isLoading: false });
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      initializeAuth: async () => {
        if (get().isInitialized) return;
        
        set({ isLoading: true });
        try {
          const response = await api.getMe();
          const userData = await response.json();
          
          if (response.ok) {
            set({ user: userData, isLoading: false, isInitialized: true });
          } else {
            set({ user: null, isLoading: false, isInitialized: true });
          }
        } catch (error) {
          set({ user: null, isLoading: false, isInitialized: true });
        }
      }
    }),
    {
      name: 'lefri-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
