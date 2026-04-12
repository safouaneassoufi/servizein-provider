import { apiClient } from './client';
import type {
  ProviderAccount,
  ProviderStats,
  ProviderService,
  AvailabilityRule,
  ServiceRequest,
  Booking,
  UpdateProviderPayload,
} from '@/types';

export const providerApi = {
  async getMe(): Promise<ProviderAccount> {
    const { data } = await apiClient.get('/provider/me');
    return data;
  },

  async setup(payload: FormData): Promise<ProviderAccount> {
    const { data } = await apiClient.post('/provider/setup', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async updateMe(payload: UpdateProviderPayload): Promise<ProviderAccount> {
    const { data } = await apiClient.patch('/provider/me', payload);
    return data;
  },

  async getStats(): Promise<ProviderStats> {
    const { data } = await apiClient.get('/provider/me/stats');
    return data;
  },

  async addService(categoryId: string, basePrice?: number): Promise<ProviderService> {
    const { data } = await apiClient.post('/provider/me/services', {
      categoryId,
      basePrice,
    });
    return data;
  },

  async toggleService(serviceId: string): Promise<ProviderService> {
    const { data } = await apiClient.patch(
      `/provider/me/services/${serviceId}/toggle`,
    );
    return data;
  },

  async deleteService(serviceId: string): Promise<void> {
    await apiClient.delete(`/provider/me/services/${serviceId}`);
  },

  async getAvailability(): Promise<AvailabilityRule[]> {
    const { data } = await apiClient.get('/provider/me/availability');
    return data;
  },

  async setAvailability(rules: AvailabilityRule[]): Promise<AvailabilityRule[]> {
    const { data } = await apiClient.put('/provider/me/availability', { rules });
    return data;
  },

  async getBookings(status?: string): Promise<Booking[]> {
    const { data } = await apiClient.get('/provider/me/bookings', {
      params: status ? { status } : undefined,
    });
    return data;
  },

  async updateBookingStatus(
    bookingId: string,
    status: string,
  ): Promise<Booking> {
    const { data } = await apiClient.patch(
      `/provider/me/bookings/${bookingId}/status`,
      { status },
    );
    return data;
  },

  async getMarketplaceRequests(params?: {
    categoryId?: string;
    city?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceRequest[]> {
    const { data } = await apiClient.get('/provider/marketplace/requests', {
      params,
    });
    return data;
  },

  async savePushToken(token: string): Promise<void> {
    await apiClient.post('/users/push-token', { token });
  },
};
