import { apiClient } from './client';
import type { Notification } from '@/types';

export const notificationsApi = {
  async getAll(): Promise<Notification[]> {
    const { data } = await apiClient.get('/notifications');
    return data;
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },
};
