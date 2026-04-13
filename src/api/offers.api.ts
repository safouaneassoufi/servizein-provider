import { apiClient } from './client';
import type { Offer, CreateOfferPayload } from '@/types';

export const offersApi = {
  /** POST /offers */
  async create(payload: CreateOfferPayload): Promise<Offer> {
    const { data } = await apiClient.post('/offers', payload);
    return data;
  },

  /** GET /offers — returns provider's own offers */
  async getMine(): Promise<Offer[]> {
    const { data } = await apiClient.get('/offers');
    return data;
  },

  /** GET /offers/:id */
  async getOne(id: string): Promise<Offer> {
    const { data } = await apiClient.get(`/offers/${id}`);
    return data;
  },

  /** PATCH /offers/:id/withdraw */
  async withdraw(id: string): Promise<Offer> {
    const { data } = await apiClient.patch(`/offers/${id}/withdraw`);
    return data;
  },

  /** PATCH /offers/:id/accept-counter */
  async acceptCounter(id: string): Promise<Offer> {
    const { data } = await apiClient.patch(`/offers/${id}/accept-counter`);
    return data;
  },

  /** PATCH /offers/:id/reject-counter */
  async rejectCounter(id: string): Promise<Offer> {
    const { data } = await apiClient.patch(`/offers/${id}/reject-counter`);
    return data;
  },
};
