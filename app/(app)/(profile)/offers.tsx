import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Tag, ChevronDown, ChevronUp } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge, offerStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  useMyOffers,
  useWithdrawOffer,
  useAcceptCounter,
  useRejectCounter,
} from '@/hooks/useOffers';
import { formatPrice, formatRelative, formatSlot } from '@/utils/format';
import type { Offer } from '@/types';

const STATUS_FILTERS = [
  { label: 'Toutes', value: '' },
  { label: 'En attente', value: 'PENDING' },
  { label: 'Contre-offre', value: 'COUNTER_OFFERED' },
  { label: 'Acceptées', value: 'ACCEPTED' },
  { label: 'Refusées', value: 'REJECTED' },
];

function OfferCard({ item }: { item: Offer }) {
  const [expanded, setExpanded] = useState(item.status === 'COUNTER_OFFERED');
  const badge = offerStatusBadge(item.status);
  const withdraw = useWithdrawOffer();
  const acceptCounter = useAcceptCounter();
  const rejectCounter = useRejectCounter();

  const handleWithdraw = () => {
    Alert.alert(
      'Retirer cette offre ?',
      'Le client ne pourra plus la voir.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => withdraw.mutate(item.id),
        },
      ],
    );
  };

  const handleAcceptCounter = () => {
    Alert.alert(
      `Accepter ${item.counterPrice ? formatPrice(item.counterPrice) : 'la contre-offre'} ?`,
      'Une mission sera créée immédiatement.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Accepter', onPress: () => acceptCounter.mutate(item.id) },
      ],
    );
  };

  const handleRejectCounter = () => {
    Alert.alert(
      'Refuser la contre-offre ?',
      'L\'offre sera marquée comme refusée.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: () => rejectCounter.mutate(item.id),
        },
      ],
    );
  };

  return (
    <View
      className={`rounded-2xl mx-4 overflow-hidden ${
        item.status === 'COUNTER_OFFERED'
          ? 'border-2 border-amber-500/50 bg-amber-500/5'
          : 'bg-slate-800'
      }`}
    >
      {/* Header row */}
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="p-4 flex-row items-start gap-3"
      >
        <View className="flex-1" style={{ gap: 4 }}>
          <View className="flex-row items-center gap-1.5">
            <Tag size={12} color="#64748b" />
            <Text className="text-slate-400 text-xs">
              {item.request?.category?.name ?? '—'}
            </Text>
          </View>
          <Text className="text-white font-semibold text-base">
            {formatPrice(item.price)}
          </Text>
          <Text className="text-slate-400 text-xs">
            {formatRelative(item.createdAt)}
          </Text>
        </View>
        <View className="items-end gap-2">
          <Badge {...badge} />
          {expanded ? (
            <ChevronUp size={16} color="#64748b" />
          ) : (
            <ChevronDown size={16} color="#64748b" />
          )}
        </View>
      </Pressable>

      {/* Expanded content */}
      {expanded && (
        <View
          className="px-4 pb-4 border-t border-slate-700/50"
          style={{ gap: 10 }}
        >
          {/* My offer details */}
          {item.message ? (
            <View style={{ gap: 2 }}>
              <Text className="text-slate-400 text-xs font-medium mt-3">
                Mon message
              </Text>
              <Text className="text-white text-sm leading-5">{item.message}</Text>
            </View>
          ) : null}

          {item.proposedDate || item.proposedSlot ? (
            <View className="flex-row gap-4 mt-1">
              {item.proposedDate ? (
                <View>
                  <Text className="text-slate-400 text-xs">Date proposée</Text>
                  <Text className="text-white text-sm">{item.proposedDate}</Text>
                </View>
              ) : null}
              {item.proposedSlot ? (
                <View>
                  <Text className="text-slate-400 text-xs">Créneau</Text>
                  <Text className="text-white text-sm">
                    {formatSlot(item.proposedSlot)}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Counter-offer block */}
          {item.status === 'COUNTER_OFFERED' && (
            <View
              className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3"
              style={{ gap: 8 }}
            >
              <Text className="text-amber-400 font-semibold text-sm">
                ↩ Contre-offre du client
              </Text>
              {item.counterPrice ? (
                <Text className="text-white font-bold text-base">
                  {formatPrice(item.counterPrice)}
                </Text>
              ) : null}
              {item.counterMessage ? (
                <Text className="text-slate-300 text-sm leading-5">
                  {item.counterMessage}
                </Text>
              ) : null}
              <View className="flex-row gap-2 mt-1">
                <Button
                  title="Accepter"
                  onPress={handleAcceptCounter}
                  loading={acceptCounter.isPending}
                  size="sm"
                  className="flex-1"
                />
                <Button
                  title="Refuser"
                  variant="danger"
                  onPress={handleRejectCounter}
                  loading={rejectCounter.isPending}
                  size="sm"
                  className="flex-1"
                />
              </View>
            </View>
          )}

          {/* Accepted — link to mission */}
          {item.status === 'ACCEPTED' && (
            <View className="bg-success/10 border border-success/30 rounded-xl p-3">
              <Text className="text-success text-sm font-semibold">
                ✓ Offre acceptée — Mission créée
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                Consultez l'onglet Missions pour gérer cette intervention.
              </Text>
            </View>
          )}

          {/* Withdraw action */}
          {item.status === 'PENDING' || item.status === 'SEEN' ? (
            <Button
              title="Retirer l'offre"
              variant="danger"
              size="sm"
              onPress={handleWithdraw}
              loading={withdraw.isPending}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

export default function MyOffersScreen() {
  const [activeFilter, setActiveFilter] = useState('');
  const { data: offers, isLoading, refetch } = useMyOffers();

  const filtered = (offers ?? []).filter((o) =>
    activeFilter ? o.status === activeFilter : true,
  );

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      <ScreenHeader title="Mes offres envoyées" back />

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 max-h-12"
        contentContainerStyle={{ gap: 8, paddingRight: 16, alignItems: 'center' }}
      >
        {STATUS_FILTERS.map((f) => (
          <Pressable
            key={f.label}
            onPress={() => setActiveFilter(f.value)}
            className={`px-3 py-1.5 rounded-full border ${
              activeFilter === f.value
                ? 'bg-accent border-accent'
                : 'border-slate-600'
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
      </ScrollView>

      {isLoading && !offers ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10, paddingVertical: 12, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="📤"
              title="Aucune offre"
              subtitle="Parcourez les demandes pour envoyer vos premières offres."
            />
          }
          renderItem={({ item }) => <OfferCard item={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
