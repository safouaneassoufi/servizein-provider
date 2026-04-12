import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications.api';
import { useProviderStore } from '@/store/provider.store';

export function useNotifications() {
  const { setUnreadCount } = useProviderStore();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const notifs = await notificationsApi.getAll();
      setUnreadCount(notifs.filter((n) => !n.read).length);
      return notifs;
    },
    staleTime: 1000 * 30,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  const { decrementUnread } = useProviderStore();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      decrementUnread();
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  const { setUnreadCount } = useProviderStore();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      setUnreadCount(0);
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
