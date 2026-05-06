import { apiClient } from './client';
import type { AuthTokens, LoginPayload, RegisterPayload } from '@/types';

export const authApi = {
  /** POST /auth/register — creates account; backend sends OTP automatically */
  register(payload: RegisterPayload): Promise<{ message: string }> {
    return apiClient.post('/auth/register', payload) as any;
  },

  /** POST /auth/send-otp — (re)sends SMS OTP */
  sendOtp(phone: string): Promise<{ message: string }> {
    return apiClient.post('/auth/send-otp', { phone }) as any;
  },

  /** POST /auth/verify-otp → { accessToken, refreshToken } */
  verifyOtp(phone: string, code: string): Promise<AuthTokens> {
    return apiClient.post('/auth/verify-otp', { phone, code }) as any;
  },

  /** POST /auth/login → { accessToken, refreshToken } */
  login(payload: LoginPayload): Promise<AuthTokens> {
    return apiClient.post('/auth/login', payload) as any;
  },

  /** POST /auth/reset-password */
  resetPassword(phone: string, code: string, newPassword: string): Promise<AuthTokens> {
    return apiClient.post('/auth/reset-password', { phone, code, newPassword }) as any;
  },

  /** POST /auth/logout */
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },
};
