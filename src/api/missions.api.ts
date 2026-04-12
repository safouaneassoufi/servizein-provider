import { apiClient } from './client';
import type { Booking } from '@/types';

export const missionsApi = {
  async getAll(status?: string): Promise<Booking[]> {
    const { data } = await apiClient.get('/provider/me/bookings', {
      params: status ? { status } : undefined,
    });
    return data;
  },

  async getOne(id: string): Promise<Booking> {
    const { data } = await apiClient.get(`/bookings/${id}`);
    return data;
  },

  async updateStatus(id: string, status: string): Promise<Booking> {
    const { data } = await apiClient.patch(
      `/provider/me/bookings/${id}/status`,
      { status },
    );
    return data;
  },
};
