import { FlatList, Text, View, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Clock, Tag } from 'lucide-react-native';
import { useMarketplaceRequests } from '@/hooks/useProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge, requestStatusBadge } from '@/components/ui/Badge';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { formatRelative } from '@/utils/format';
import type { ServiceRequest } from '@/types';

function RequestCard({ item }: { item: ServiceRequest }) {
  const badge = requestStatusBadge(item.status);
  return (
    <Pressable
      onPress={() => router.push(`/(app)/(requests)/${item.id}` as any)}
      className="bg-slate-800 rounded-2xl p-4 mx-4 gap-3"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Tag size={14} color="#64748b" />
            <Text className="text-slate-400 text-xs">{item.category?.name}</Text>
          </View>
          <Text className="text-white font-semibold text-base" numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <Badge {...badge} />
      </View>

      <View className="flex-row items-center gap-4">
        {item.city && (
          <View className="flex-row items-center gap-1">
            <MapPin size={13} color="#64748b" />
            <Text className="text-slate-400 text-xs">{item.city}</Text>
          </View>
        )}
        <View className="flex-row items-center gap-1">
          <Clock size={13} color="#64748b" />
          <Text className="text-slate-400 text-xs">{formatRelative(item.createdAt)}</Text>
        </View>
        <Text className="text-slate-500 text-xs">
          {item.offerCount} offre{item.offerCount !== 1 ? 's' : ''}
        </Text>
      </View>
    </Pressable>
  );
}

export default function RequestsTab() {
  const { data: requests, isLoading, refetch } = useMarketplaceRequests();

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Demandes ouvertes" subtitle="Trouvez des clients à servir" />

      {isLoading && !requests ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={requests ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#3b82f6" />
          }
          ListEmptyComponent={
            <EmptyState
              icon="📭"
              title="Aucune demande ouverte"
              subtitle="Revenez plus tard pour voir de nouvelles demandes."
            />
          }
          renderItem={({ item }) => <RequestCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}
