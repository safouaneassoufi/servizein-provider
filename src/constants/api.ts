import Constants from 'expo-constants';

// Read directly from app.json extra — change apiUrl to your backend IP/URL for dev
export const API_BASE_URL: string =
  Constants.expoConfig?.extra?.apiUrl ?? 'http://172.20.10.5:3000/api/v1';

export const ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_VERIFY_OTP: '/auth/verify-otp',
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  AUTH_LOGOUT: '/auth/logout',

  // Provider
  PROVIDER_ME: '/provider/me',
  PROVIDER_SETUP: '/provider/setup',
  PROVIDER_UPDATE: '/provider/me',
  PROVIDER_STATS: '/provider/me/stats',
  PROVIDER_SERVICES: '/provider/me/services',
  PROVIDER_AVAILABILITY: '/provider/me/availability',
  PROVIDER_BOOKINGS: '/provider/me/bookings',
  PROVIDER_MARKETPLACE: '/provider/marketplace/requests',

  // Offers
  OFFERS: '/offers',
  MY_OFFERS: '/offers/mine',

  // Missions (bookings from provider POV)
  MISSIONS: '/bookings',

  // Notifications
  PUSH_TOKEN: '/users/push-token',
  NOTIFICATIONS: '/notifications',

  // Media
  MEDIA_UPLOAD: '/media/upload',
} as const;
