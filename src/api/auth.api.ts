import { apiClient } from './client';
import type { AuthTokens, LoginPayload, RegisterPayload } from '@/types';

export const authApi = {
  /** POST /auth/register — expects { name, phone, password } */
  async register(payload: RegisterPayload): Promise<{ message: string }> {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  /** POST /auth/send-otp — sends OTP for registration */
  async sendOtp(phone: string): Promise<{ message: string }> {
    const { data } = await apiClient.post('/auth/send-otp', { phone });
    return data;
  },

  /** POST /auth/verify-otp — verifies OTP and returns tokens */
  async verifyOtp(phone: string, code: string): Promise<AuthTokens> {
    const { data } = await apiClient.post('/auth/verify-otp', { phone, code });
    return data;
  },

  /** POST /auth/login — expects { identifier, password } */
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  },

  /** POST /auth/reset-password */
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

  /** POST /auth/logout */
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },
};
