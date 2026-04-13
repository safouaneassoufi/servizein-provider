import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { authApi } from '@/api/auth.api';
import { providerApi } from '@/api/provider.api';
import { useAuthStore } from '@/store/auth.store';
import { useProviderStore } from '@/store/provider.store';
import type { LoginPayload, RegisterPayload } from '@/types';
import { registerPushToken } from './usePushNotifications';

// ─── Register (step 1: create account) ───────────────────────────────────────
export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });
}

// ─── Verify OTP (step 2: get tokens) ─────────────────────────────────────────
export function useVerifyOtp() {
  const { setTokens } = useAuthStore();
  const { setProfile } = useProviderStore();

  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      authApi.verifyOtp(phone, code),
    onSuccess: async (tokens) => {
      await setTokens(tokens);
      // Try to fetch provider profile (may not exist yet for new registrations)
      try {
        const profile = await providerApi.getMe();
        setProfile(profile);
        registerPushToken().catch(() => {});
        // Has profile → go to dashboard
        router.replace('/(app)/(dashboard)' as any);
      } catch {
        // No provider account yet → go to onboarding
        registerPushToken().catch(() => {});
        router.replace('/(onboarding)/identity');
      }
    },
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function useLogin() {
  const { setTokens } = useAuthStore();
  const { setProfile } = useProviderStore();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (tokens) => {
      await setTokens(tokens);
      try {
        const profile = await providerApi.getMe();
        setProfile(profile);
        registerPushToken().catch(() => {});
        // Check if onboarding complete (has bio or city)
        if (!profile.bio && !profile.city) {
          router.replace('/(onboarding)/identity');
        } else {
          router.replace('/(app)/(dashboard)' as any);
        }
      } catch {
        // No provider account → onboarding
        router.replace('/(onboarding)/identity');
      }
    },
  });
}

// ─── Send OTP for password reset ──────────────────────────────────────────────
export function useSendOtp() {
  return useMutation({
    mutationFn: (phone: string) => authApi.sendOtp(phone),
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export function useLogout() {
  const { clearAuth, refreshToken } = useAuthStore();
  const { clear } = useProviderStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => {});
      }
    },
    onSettled: async () => {
      await clearAuth();
      clear();
      queryClient.clear();
      router.replace('/(auth)/welcome');
    },
  });
}

// ─── Fetch + cache provider profile ──────────────────────────────────────────
export function useProviderProfile() {
  const { isAuthenticated } = useAuthStore();
  const { setProfile } = useProviderStore();

  return useQuery({
    queryKey: ['provider', 'me'],
    queryFn: async () => {
      const profile = await providerApi.getMe();
      setProfile(profile);
      return profile;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}
