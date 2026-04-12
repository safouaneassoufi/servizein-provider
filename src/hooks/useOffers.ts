import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { offersApi } from '@/api/offers.api';
import type { CreateOfferPayload } from '@/types';

export function useMyOffers() {
  return useQuery({
    queryKey: ['offers', 'mine'],
    queryFn: () => offersApi.getMine(),
    staleTime: 1000 * 30,
  });
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: ['offers', id],
    queryFn: () => offersApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOfferPayload) => offersApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers', 'mine'] });
      qc.invalidateQueries({ queryKey: ['marketplace', 'requests'] });
    },
  });
}

export function useWithdrawOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offersApi.withdraw(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers', 'mine'] }),
  });
}

export function useAcceptCounter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offersApi.acceptCounter(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['offers', id] });
      qc.invalidateQueries({ queryKey: ['offers', 'mine'] });
      qc.invalidateQueries({ queryKey: ['missions'] });
    },
  });
}

export function useRejectCounter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => offersApi.rejectCounter(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['offers', id] });
      qc.invalidateQueries({ queryKey: ['offers', 'mine'] });
    },
  });
}
