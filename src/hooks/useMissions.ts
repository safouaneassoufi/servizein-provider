import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { missionsApi } from '@/api/missions.api';

export function useMissions(status?: string) {
  return useQuery({
    queryKey: ['missions', status],
    queryFn: () => missionsApi.getAll(status),
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
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      missionsApi.updateStatus(id, status),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['missions'] });
      qc.setQueryData(['missions', 'detail', updated.id], updated);
    },
  });
}
