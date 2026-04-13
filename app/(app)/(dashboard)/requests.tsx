import { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Clock, Search, SlidersHorizontal } from 'lucide-react-native';
import { useMarketplaceRequests } from '@/hooks/useProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge, requestStatusBadge } from '@/components/ui/Badge';
import { formatRelative } from '@/utils/format';
import type { ServiceRequest } from '@/types';

const CITIES = ['Toutes', 'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir'];

function RequestCard({ item }: { item: ServiceRequest }) {
  const badge = requestStatusBadge(item.status);
  return (
    <Pressable
      onPress={() => router.push(`/(app)/(requests)/${item.id}` as any)}
      className="bg-slate-800 rounded-2xl p-4 mx-4"
      style={{ gap: 12 }}
    >
      {/* Top row */}
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1" style={{ gap: 4 }}>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-accent text-xs font-medium">
              {item.category?.name ?? '—'}
            </Text>
          </View>
          <Text
            className="text-white font-semibold text-base leading-5"
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>
        <Badge {...badge} />
      </View>

      {/* Meta */}
      <View className="flex-row items-center gap-4">
        {item.city ? (
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color="#64748b" />
            <Text className="text-slate-400 text-xs">{item.city}</Text>
          </View>
        ) : null}
        <View className="flex-row items-center gap-1">
          <Clock size={12} color="#64748b" />
          <Text className="text-slate-400 text-xs">
            {formatRelative(item.createdAt)}
          </Text>
        </View>
        <Text className="text-slate-500 text-xs ml-auto">
          {item.offerCount} offre{item.offerCount !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Photos strip */}
      {item.photoUrls?.length > 0 && (
        <Text className="text-slate-500 text-xs">
          📷 {item.photoUrls.length} photo{item.photoUrls.length > 1 ? 's' : ''}
        </Text>
      )}
    </Pressable>
  );
}

export default function RequestsTab() {
  const [selectedCity, setSelectedCity] = useState('Toutes');
  const [search, setSearch] = useState('');

  const { data: allRequests, isLoading, refetch } = useMarketplaceRequests({});

  // Client-side city filter (backend doesn't support city param)
  const requests = selectedCity !== 'Toutes'
    ? (allRequests ?? []).filter((r) => r.city === selectedCity)
    : allRequests;

  const filtered = (requests ?? []).filter((r) =>
    search
      ? r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.name.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2" style={{ gap: 12 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-xl font-bold">Demandes ouvertes</Text>
            <Text className="text-slate-400 text-xs">
              {filtered.length} demande{filtered.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <SlidersHorizontal size={20} color="#64748b" />
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-slate-800 rounded-xl px-3 gap-2">
          <Search size={16} color="#64748b" />
          <TextInput
            className="flex-1 text-white py-3 text-sm"
            placeholder="Rechercher…"
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* City filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pb-1">
            {CITIES.map((city) => (
              <Pressable
                key={city}
                onPress={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-full border ${
                  selectedCity === city
                    ? 'bg-accent border-accent'
                    : 'bg-transparent border-slate-600'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    selectedCity === city ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {city}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {isLoading && !requests ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
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
              icon="📭"
              title="Aucune demande"
              subtitle={
                selectedCity !== 'Toutes'
                  ? `Pas de demandes à ${selectedCity} pour l'instant.`
                  : 'Revenez plus tard pour voir de nouvelles demandes.'
              }
            />
          }
          renderItem={({ item }) => <RequestCard item={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
