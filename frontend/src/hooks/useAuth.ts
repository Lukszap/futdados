import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Club } from '@/lib/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  club: Club | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name?: string, club_name?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  fetchClub: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      club: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const formData = new FormData();
          formData.append('username', email);
          formData.append('password', password);

          const response = await api.post('/api/auth/login', formData);
          const { access_token } = response.data;

          localStorage.setItem('token', access_token);
          set({ token: access_token });

          // Fetch user info
          await get().fetchUser();
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email: string, password: string, full_name?: string, club_name?: string) => {
        set({ isLoading: true });
        try {
          await api.post('/api/auth/register', {
            email,
            password,
            full_name,
            club_name,
          });
        } catch (error) {
          console.error('Register error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, club: null, token: null });
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/api/auth/me');
          set({ user: response.data });
        } catch (error) {
          console.error('Fetch user error:', error);
        }
      },

      fetchClub: async () => {
        try {
          const response = await api.get('/api/clubs/');
          set({ club: response.data });
        } catch (error) {
          console.error('Fetch club error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
