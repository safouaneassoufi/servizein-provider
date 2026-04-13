import { apiClient } from './client';
import type { Notification } from '@/types';

export const notificationsApi = {
  /** GET /notifications */
  async getAll(): Promise<Notification[]> {
    const { data } = await apiClient.get('/notifications');
    return data;
  },

  /** GET /notifications/unread-count */
  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get('/notifications/unread-count');
    return typeof data === 'number' ? data : data?.count ?? 0;
  },

  /** PATCH /notifications/:id/read */
  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  /** PATCH /notifications/read-all */
  async markAllRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },
};
