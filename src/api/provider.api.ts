import { apiClient } from './client';
import type {
  ProviderAccount,
  ProviderStats,
  ProviderService,
  AvailabilityRule,
  ServiceRequest,
  Booking,
  UpdateProviderPayload,
  AddServicePayload,
} from '@/types';

export const providerApi = {
  getMe(): Promise<ProviderAccount> {
    return apiClient.get('/provider/me') as any;
  },

  setup(payload: UpdateProviderPayload): Promise<ProviderAccount> {
    return apiClient.post('/provider/setup', payload) as any;
  },

  updateMe(payload: UpdateProviderPayload): Promise<ProviderAccount> {
    return apiClient.put('/provider/me', payload) as any;
  },

  getStats(): Promise<ProviderStats> {
    return apiClient.get('/provider/me/stats') as any;
  },

  addService(payload: AddServicePayload): Promise<ProviderService> {
    return apiClient.post('/provider/me/services', payload) as any;
  },

  toggleService(serviceId: string): Promise<ProviderService> {
    return apiClient.patch(`/provider/me/services/${serviceId}/toggle`) as any;
  },

  deleteService(serviceId: string): Promise<void> {
    return apiClient.delete(`/provider/me/services/${serviceId}`) as any;
  },

  getAvailability(): Promise<AvailabilityRule[]> {
    return apiClient.get('/provider/me/availability') as any;
  },

  setAvailability(rules: AvailabilityRule[]): Promise<AvailabilityRule[]> {
    return apiClient.put('/provider/me/availability', { rules }) as any;
  },

  getBookings(): Promise<Booking[]> {
    return apiClient.get('/provider/me/bookings') as any;
  },

  updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    return apiClient.patch(`/provider/me/bookings/${bookingId}/status`, { status }) as any;
  },

  getMarketplaceRequests(params?: { categoryId?: string }): Promise<ServiceRequest[]> {
    return apiClient.get('/provider/marketplace/requests', { params }) as any;
  },

  async savePushToken(token: string): Promise<void> {
    await apiClient.post('/users/push-token', { token });
  },
};
