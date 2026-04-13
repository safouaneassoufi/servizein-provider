import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelative, userName, userInitials } from '@/utils/format';
import type { Booking } from '@/types';

// Conversations = missions actives/confirmées
function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await apiClient.get<Booking[]>('/provider/me/bookings');
      // Only missions that have been confirmed (a mission = conversation exists)
      return data.filter((b) =>
        ['CONFIRMED', 'PROVIDER_EN_ROUTE', 'PROVIDER_ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(
          b.status,
        ),
      );
    },
    refetchInterval: 30_000,
  });
}

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: '✅ Mission confirmée',
  PROVIDER_EN_ROUTE: '🚗 En route',
  PROVIDER_ARRIVED: '📍 Arrivé sur place',
  IN_PROGRESS: '🔧 Mission en cours',
  COMPLETED: '✓ Terminée',
};

function ConversationItem({ item }: { item: Booking }) {
  const initials = userInitials(item.client);

  return (
    <Pressable
      onPress={() => router.push(`/(app)/(messages)/${item.id}` as any)}
      className="flex-row items-center px-4 py-4 border-b border-slate-800 gap-3"
    >
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full bg-accent items-center justify-center">
        <Text className="text-white font-bold">{initials}</Text>
      </View>

      {/* Content */}
      <View className="flex-1" style={{ gap: 3 }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-white font-semibold">
            {userName(item.client)}
          </Text>
          <Text className="text-slate-500 text-xs">
            {formatRelative(item.updatedAt ?? item.createdAt)}
          </Text>
        </View>
        <Text className="text-slate-400 text-sm" numberOfLines={1}>
          {STATUS_LABEL[item.status] ?? item.category?.name}
        </Text>
        <Text className="text-slate-500 text-xs">{item.category?.name}</Text>
      </View>
    </Pressable>
  );
}

export default function MessagesTab() {
  const { data: conversations, isLoading, refetch } = useConversations();

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-white text-xl font-bold">Messages</Text>
        <Text className="text-slate-400 text-xs mt-0.5">
          Conversations liées à vos missions
        </Text>
      </View>

      {isLoading && !conversations ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={conversations ?? []}
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
              icon="💬"
              title="Aucune conversation"
              subtitle="Vos échanges avec les clients apparaîtront ici une fois une mission confirmée."
            />
          }
          renderItem={({ item }) => <ConversationItem item={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
