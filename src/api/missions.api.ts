import { apiClient } from './client';
import type { Booking } from '@/types';

export const missionsApi = {
  /** GET /provider/me/bookings */
  async getAll(): Promise<Booking[]> {
    const { data } = await apiClient.get('/provider/me/bookings');
    return data;
  },

  /** GET /bookings/:id */
  async getOne(id: string): Promise<Booking> {
    const { data } = await apiClient.get(`/bookings/${id}`);
    return data;
  },

  /** PATCH /provider/me/bookings/:id/status */
  async updateStatus(id: string, status: string): Promise<Booking> {
    const { data } = await apiClient.patch(
      `/provider/me/bookings/${id}/status`,
      { status },
    );
    return data;
  },
};
