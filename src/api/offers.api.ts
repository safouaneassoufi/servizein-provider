import { apiClient } from './client';
import type { Offer, CreateOfferPayload } from '@/types';

export const offersApi = {
  async create(payload: CreateOfferPayload): Promise<Offer> {
    const { data } = await apiClient.post('/offers', payload);
    return data;
  },

  async getMine(): Promise<Offer[]> {
    const { data } = await apiClient.get('/offers/mine');
    return data;
  },

  async getOne(id: string): Promise<Offer> {
    const { data } = await apiClient.get(`/offers/${id}`);
    return data;
  },

  async withdraw(id: string): Promise<Offer> {
    const { data } = await apiClient.patch(`/offers/${id}/withdraw`);
    return data;
  },

  async acceptCounter(id: string): Promise<Offer> {
    const { data } = await apiClient.patch(`/offers/${id}/accept-counter`);
    return data;
  },

  async rejectCounter(id: string): Promise<Offer> {
    const { data } = await apiClient.patch(`/offers/${id}/reject-counter`);
    return data;
  },
};
