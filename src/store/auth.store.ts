import { create } from 'zustand';
import { storage } from '@/utils/storage';
import type { AuthTokens, ProviderAccount } from '@/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  provider: ProviderAccount | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setTokens: (tokens: AuthTokens) => Promise<void>;
  setProvider: (provider: ProviderAccount) => void;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  provider: null,
  isAuthenticated: false,
  isHydrated: false,

  setTokens: async (tokens) => {
    await storage.setTokens(tokens.accessToken, tokens.refreshToken);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
    });
  },

  setProvider: (provider) => {
    set({ provider });
  },

  clearAuth: async () => {
    await storage.clearTokens();
    set({
      accessToken: null,
      refreshToken: null,
      provider: null,
      isAuthenticated: false,
    });
  },

  hydrate: async () => {
    const [accessToken, refreshToken] = await Promise.all([
      storage.getAccessToken(),
      storage.getRefreshToken(),
    ]);
    set({
      accessToken,
      refreshToken,
      isAuthenticated: !!accessToken && !!refreshToken,
      isHydrated: true,
    });
  },
}));
