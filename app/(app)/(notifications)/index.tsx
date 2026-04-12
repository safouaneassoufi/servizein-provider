import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { formatRelative } from '@/utils/format';
import type { Notification } from '@/types';

function NotificationItem({ item }: { item: Notification }) {
  const markRead = useMarkRead();
  return (
    <Pressable
      onPress={() => !item.read && markRead.mutate(item.id)}
      className={`px-4 py-4 border-b border-slate-800 flex-row gap-3 ${
        !item.read ? 'bg-accent/5' : ''
      }`}
    >
      <View className={`w-2 h-2 rounded-full mt-1.5 ${item.read ? 'bg-transparent' : 'bg-accent'}`} />
      <View className="flex-1 gap-1">
        <Text className="text-white font-semibold text-sm">{item.title}</Text>
        <Text className="text-slate-400 text-sm leading-5">{item.body}</Text>
        <Text className="text-slate-500 text-xs">{formatRelative(item.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { data: notifications, isLoading, refetch } = useNotifications();
  const markAllRead = useMarkAllRead();

  const hasUnread = notifications?.some((n) => !n.read);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <ScreenHeader title="Notifications" />
        {hasUnread && (
          <Button
            title="Tout lire"
            variant="ghost"
            size="sm"
            onPress={() => markAllRead.mutate()}
          />
        )}
      </View>

      {isLoading && !notifications ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={notifications ?? []}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#3b82f6" />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🔔"
              title="Aucune notification"
              subtitle="Vous n'avez pas encore de notifications."
            />
          }
          renderItem={({ item }) => <NotificationItem item={item} />}
        />
      )}
    </SafeAreaView>
  );
}
