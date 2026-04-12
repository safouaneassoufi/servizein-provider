import { create } from 'zustand';
import type { ProviderAccount, ProviderStats } from '@/types';

interface ProviderState {
  profile: ProviderAccount | null;
  stats: ProviderStats | null;
  unreadCount: number;

  setProfile: (profile: ProviderAccount) => void;
  setStats: (stats: ProviderStats) => void;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  clear: () => void;
}

export const useProviderStore = create<ProviderState>((set) => ({
  profile: null,
  stats: null,
  unreadCount: 0,

  setProfile: (profile) => set({ profile }),
  setStats: (stats) => set({ stats }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnread: () =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  clear: () => set({ profile: null, stats: null, unreadCount: 0 }),
}));
