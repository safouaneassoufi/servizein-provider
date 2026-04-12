import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, MapPin } from 'lucide-react-native';
import { useMissions } from '@/hooks/useMissions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge, missionStatusBadge } from '@/components/ui/Badge';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { formatDate, formatPrice } from '@/utils/format';
import type { Booking } from '@/types';

function MissionCard({ item }: { item: Booking }) {
  const badge = missionStatusBadge(item.status);
  return (
    <Pressable
      onPress={() => router.push(`/(app)/(missions)/${item.id}` as any)}
      className="bg-slate-800 rounded-2xl p-4 mx-4 gap-3"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-1">
          <Text className="text-slate-400 text-xs">{item.category?.name}</Text>
          <Text className="text-white font-semibold">
            {item.client?.firstName} {item.client?.lastName}
          </Text>
        </View>
        <Badge {...badge} />
      </View>

      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center gap-1">
          <Calendar size={13} color="#64748b" />
          <Text className="text-slate-400 text-xs">{formatDate(item.scheduledAt)}</Text>
        </View>
        {item.address && (
          <View className="flex-row items-center gap-1">
            <MapPin size={13} color="#64748b" />
            <Text className="text-slate-400 text-xs" numberOfLines={1}>{item.address}</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-slate-400 text-xs">Montant à recevoir</Text>
        <Text className="text-success font-bold">{formatPrice(item.providerAmount)}</Text>
      </View>
    </Pressable>
  );
}

export default function MissionsTab() {
  const { data: missions, isLoading, refetch } = useMissions();

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Mes missions" subtitle="Toutes vos missions" />

      {isLoading && !missions ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={missions ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#3b82f6" />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🎯"
              title="Aucune mission"
              subtitle="Vos missions acceptées apparaîtront ici."
            />
          }
          renderItem={({ item }) => <MissionCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}
