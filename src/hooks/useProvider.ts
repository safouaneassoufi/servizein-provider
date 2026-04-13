import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { providerApi } from '@/api/provider.api';
import { useProviderStore } from '@/store/provider.store';
import type { AvailabilityRule, UpdateProviderPayload, AddServicePayload } from '@/types';

export function useProviderStats() {
  const { setStats } = useProviderStore();
  return useQuery({
    queryKey: ['provider', 'stats'],
    queryFn: async () => {
      const stats = await providerApi.getStats();
      // Normalise field names for the UI
      const normalised = {
        ...stats,
        rating: stats.averageRating,
        monthlyEarnings: 0, // not in backend yet, default 0
        activeMissions: 0,  // will be derived from bookings
        pendingOffers: 0,   // will be derived from offers
      };
      setStats(normalised);
      return normalised;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateProvider() {
  const qc = useQueryClient();
  const { setProfile } = useProviderStore();
  return useMutation({
    mutationFn: (payload: UpdateProviderPayload) => providerApi.updateMe(payload),
    onSuccess: (updated) => {
      setProfile(updated);
      qc.setQueryData(['provider', 'me'], updated);
    },
  });
}

export function useAvailability() {
  return useQuery({
    queryKey: ['provider', 'availability'],
    queryFn: () => providerApi.getAvailability(),
  });
}

export function useSetAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rules: AvailabilityRule[]) => providerApi.setAvailability(rules),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider', 'availability'] }),
  });
}

export function useAddService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddServicePayload) => providerApi.addService(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider', 'me'] }),
  });
}

export function useToggleService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) => providerApi.toggleService(serviceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider', 'me'] }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) => providerApi.deleteService(serviceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider', 'me'] }),
  });
}

export function useMarketplaceRequests(params?: { categoryId?: string }) {
  return useQuery({
    queryKey: ['marketplace', 'requests', params],
    queryFn: () => providerApi.getMarketplaceRequests(params),
    staleTime: 1000 * 30,
  });
}
