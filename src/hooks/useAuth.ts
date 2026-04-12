import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { authApi } from '@/api/auth.api';
import { providerApi } from '@/api/provider.api';
import { useAuthStore } from '@/store/auth.store';
import { useProviderStore } from '@/store/provider.store';
import type { LoginPayload, RegisterPayload, VerifyOtpPayload } from '@/types';
import { registerPushToken } from './usePushNotifications';

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });
}

export function useVerifyOtp() {
  const { setTokens } = useAuthStore();
  const { setProfile } = useProviderStore();

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authApi.verifyOtp(payload),
    onSuccess: async (tokens, variables) => {
      await setTokens(tokens);
      if (variables.purpose === 'REGISTER') {
        try {
          const profile = await providerApi.getMe();
          setProfile(profile);
        } catch {}
        registerPushToken().catch(() => {});
        router.replace('/(onboarding)/identity');
      }
    },
  });
}

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

        if (!profile.bio && !profile.city) {
          router.replace('/(onboarding)/identity');
        } else {
          router.replace('/(app)/(dashboard)');
        }
      } catch {
        router.replace('/(app)/(dashboard)');
      }
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (phone: string) => authApi.forgotPassword(phone),
  });
}

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
