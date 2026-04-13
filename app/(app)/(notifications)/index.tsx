import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { formatRelative } from '@/utils/format';
import type { Notification } from '@/types';

const TYPE_ICON: Record<string, string> = {
  NEW_REQUEST: '📋',
  OFFER_ACCEPTED: '✅',
  OFFER_REJECTED: '❌',
  OFFER_COUNTER: '↩️',
  MISSION_CONFIRMED: '🎯',
  MISSION_STARTED: '🔧',
  MISSION_COMPLETED: '🏆',
  PAYMENT_RECEIVED: '💰',
  REVIEW_RECEIVED: '⭐',
  KYC_APPROVED: '✅',
  KYC_REJECTED: '⚠️',
  SYSTEM: '🔔',
};

function NotificationItem({ item }: { item: Notification }) {
  const markRead = useMarkRead();
  return (
    <Pressable
      onPress={() => {
        if (!item.read) markRead.mutate(item.id);
      }}
      className={`flex-row items-start px-4 py-4 border-b border-slate-800/80 gap-3 ${
        !item.read ? 'bg-accent/5' : ''
      }`}
    >
      {/* Unread indicator */}
      <View className="pt-1">
        {!item.read ? (
          <View className="w-2 h-2 rounded-full bg-accent" />
        ) : (
          <View className="w-2 h-2" />
        )}
      </View>

      {/* Icon */}
      <Text style={{ fontSize: 22 }}>
        {TYPE_ICON[item.type] ?? '🔔'}
      </Text>

      {/* Content */}
      <View className="flex-1" style={{ gap: 3 }}>
        <Text className="text-white font-semibold text-sm">{item.title}</Text>
        <Text className="text-slate-400 text-sm leading-5">{item.body}</Text>
        <Text className="text-slate-500 text-xs">
          {formatRelative(item.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { data: notifications, isLoading, refetch } = useNotifications();
  const markAllRead = useMarkAllRead();

  const hasUnread = (notifications ?? []).some((n) => !n.read);

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      <View className="flex-row items-center justify-between pr-4">
        <ScreenHeader title="Notifications" />
        {hasUnread && (
          <Button
            title="Tout lire"
            variant="ghost"
            size="sm"
            onPress={() => markAllRead.mutate()}
            loading={markAllRead.isPending}
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
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🔔"
              title="Aucune notification"
              subtitle="Les nouvelles demandes, réponses à vos offres et mises à jour apparaîtront ici."
            />
          }
          renderItem={({ item }) => <NotificationItem item={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
