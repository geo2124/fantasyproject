import { create } from 'zustand';
import { User } from '../types';
import { auth, provider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!auth || !provider) throw new Error("Firebase not configured");
      const result = await signInWithPopup(auth, provider);
      
      const fbUser = result.user;
      const u: User = {
        id: fbUser.uid,
        username: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        email: fbUser.email || '',
        role: 'user'
      };
      
      set({ user: u, isLoading: false, error: null });
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message, isLoading: false });
      } else {
        set({ error: String(err), isLoading: false });
      }
    }
  },
  logout: async () => {
    try {
      if (auth) await signOut(auth);
    } finally {
      set({ user: null });
    }
  }
}));
