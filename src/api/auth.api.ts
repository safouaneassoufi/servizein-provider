import { apiClient } from './client';
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
} from '@/types';

export const authApi = {
  async register(payload: RegisterPayload): Promise<{ message: string }> {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthTokens> {
    const { data } = await apiClient.post('/auth/verify-otp', payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  },

  async forgotPassword(phone: string): Promise<{ message: string }> {
    const { data } = await apiClient.post('/auth/forgot-password', { phone });
    return data;
  },

  async resetPassword(
    phone: string,
    code: string,
    newPassword: string,
  ): Promise<AuthTokens> {
    const { data } = await apiClient.post('/auth/reset-password', {
      phone,
      code,
      newPassword,
    });
    return data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },
};
