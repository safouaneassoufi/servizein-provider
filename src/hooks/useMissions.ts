import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { missionsApi } from '@/api/missions.api';
import type { BookingStatus } from '@/types';

export function useMissions(statusFilter?: string) {
  return useQuery({
    queryKey: ['missions', statusFilter],
    queryFn: async () => {
      const all = await missionsApi.getAll();
      if (!statusFilter) return all;
      return all.filter((b) => b.status === statusFilter);
    },
    staleTime: 1000 * 30,
  });
}

export function useMission(id: string) {
  return useQuery({
    queryKey: ['missions', 'detail', id],
    queryFn: () => missionsApi.getOne(id),
    enabled: !!id,
  });
}

export function useUpdateMissionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      missionsApi.updateStatus(id, status),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['missions'] });
      qc.setQueryData(['missions', 'detail', updated.id], updated);
    },
  });
}
