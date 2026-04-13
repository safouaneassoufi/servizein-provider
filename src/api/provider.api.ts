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
  /** GET /provider/me */
  async getMe(): Promise<ProviderAccount> {
    const { data } = await apiClient.get('/provider/me');
    return data;
  },

  /** POST /provider/setup */
  async setup(payload: UpdateProviderPayload): Promise<ProviderAccount> {
    const { data } = await apiClient.post('/provider/setup', payload);
    return data;
  },

  /** PUT /provider/me */
  async updateMe(payload: UpdateProviderPayload): Promise<ProviderAccount> {
    const { data } = await apiClient.put('/provider/me', payload);
    return data;
  },

  /** GET /provider/me/stats */
  async getStats(): Promise<ProviderStats> {
    const { data } = await apiClient.get('/provider/me/stats');
    return data;
  },

  /** POST /provider/me/services */
  async addService(payload: AddServicePayload): Promise<ProviderService> {
    const { data } = await apiClient.post('/provider/me/services', payload);
    return data;
  },

  /** PATCH /provider/me/services/:id/toggle */
  async toggleService(serviceId: string): Promise<ProviderService> {
    const { data } = await apiClient.patch(
      `/provider/me/services/${serviceId}/toggle`,
    );
    return data;
  },

  /** DELETE /provider/me/services/:id */
  async deleteService(serviceId: string): Promise<void> {
    await apiClient.delete(`/provider/me/services/${serviceId}`);
  },

  /** GET /provider/me/availability */
  async getAvailability(): Promise<AvailabilityRule[]> {
    const { data } = await apiClient.get('/provider/me/availability');
    return data;
  },

  /** PUT /provider/me/availability */
  async setAvailability(rules: AvailabilityRule[]): Promise<AvailabilityRule[]> {
    const { data } = await apiClient.put('/provider/me/availability', { rules });
    return data;
  },

  /** GET /provider/me/bookings */
  async getBookings(): Promise<Booking[]> {
    const { data } = await apiClient.get('/provider/me/bookings');
    return data;
  },

  /** PATCH /provider/me/bookings/:id/status */
  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    const { data } = await apiClient.patch(
      `/provider/me/bookings/${bookingId}/status`,
      { status },
    );
    return data;
  },

  /** GET /provider/marketplace/requests?categoryId= */
  async getMarketplaceRequests(params?: {
    categoryId?: string;
  }): Promise<ServiceRequest[]> {
    const { data } = await apiClient.get('/provider/marketplace/requests', {
      params,
    });
    return data;
  },

  /** POST /users/push-token */
  async savePushToken(token: string): Promise<void> {
    await apiClient.post('/users/push-token', { token });
  },
};
