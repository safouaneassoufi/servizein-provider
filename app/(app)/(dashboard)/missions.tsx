import { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, ChevronRight } from 'lucide-react-native';
import { useMissions } from '@/hooks/useMissions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge, missionStatusBadge } from '@/components/ui/Badge';
import { formatDate, formatPrice } from '@/utils/format';
import type { Booking } from '@/types';

const FILTERS = [
  { label: 'Toutes', value: undefined },
  { label: 'Confirmées', value: 'CONFIRMED' },
  { label: 'En cours', value: 'IN_PROGRESS' },
  { label: 'Terminées', value: 'COMPLETED' },
  { label: 'Annulées', value: 'CANCELLED' },
];

function MissionCard({ item }: { item: Booking }) {
  const badge = missionStatusBadge(item.status);

  const isActive = ['CONFIRMED', 'PROVIDER_EN_ROUTE', 'PROVIDER_ARRIVED', 'IN_PROGRESS'].includes(
    item.status,
  );

  return (
    <Pressable
      onPress={() => router.push(`/(app)/(missions)/${item.id}` as any)}
      className={`rounded-2xl p-4 mx-4 ${isActive ? 'bg-accent/10 border border-accent/30' : 'bg-slate-800'}`}
      style={{ gap: 12 }}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1" style={{ gap: 3 }}>
          <Text className="text-slate-400 text-xs">{item.category?.name}</Text>
          <Text className="text-white font-semibold">
            {item.client?.firstName} {item.client?.lastName}
          </Text>
        </View>
        <Badge {...badge} />
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Calendar size={13} color="#64748b" />
          <Text className="text-slate-400 text-xs">
            {formatDate(item.scheduledAt, 'EEE dd MMM yyyy')}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-success font-bold text-sm">
            {formatPrice(item.providerAmount)}
          </Text>
          <ChevronRight size={14} color="#64748b" />
        </View>
      </View>
    </Pressable>
  );
}

export default function MissionsTab() {
  const [activeFilter, setActiveFilter] = useState<string | undefined>(undefined);
  const { data: missions, isLoading, refetch } = useMissions(activeFilter);

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2" style={{ gap: 12 }}>
        <Text className="text-white text-xl font-bold">Mes missions</Text>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pb-1">
            {FILTERS.map((f) => (
              <Pressable
                key={f.label}
                onPress={() => setActiveFilter(f.value)}
                className={`px-3 py-1.5 rounded-full border ${
                  activeFilter === f.value
                    ? 'bg-accent border-accent'
                    : 'bg-transparent border-slate-600'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    activeFilter === f.value ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {isLoading && !missions ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={missions ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10, paddingVertical: 8, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🎯"
              title="Aucune mission"
              subtitle="Vos missions confirmées apparaîtront ici."
            />
          }
          renderItem={({ item }) => <MissionCard item={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
