import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Tag } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge, offerStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useMyOffers, useWithdrawOffer } from '@/hooks/useOffers';
import { formatPrice, formatRelative } from '@/utils/format';
import { Alert } from 'react-native';
import type { Offer } from '@/types';

function OfferCard({ item }: { item: Offer }) {
  const badge = offerStatusBadge(item.status);
  const withdraw = useWithdrawOffer();

  const handleWithdraw = () => {
    Alert.alert('Retirer l\'offre ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: () => withdraw.mutate(item.id),
      },
    ]);
  };

  return (
    <View className="bg-slate-800 rounded-2xl p-4 mx-4 gap-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Tag size={13} color="#64748b" />
            <Text className="text-slate-400 text-xs">
              {item.request?.category?.name}
            </Text>
          </View>
          <Text className="text-white font-semibold text-base">
            {formatPrice(item.price)}
          </Text>
        </View>
        <Badge {...badge} />
      </View>

      {item.message && (
        <Text className="text-slate-400 text-sm" numberOfLines={2}>
          {item.message}
        </Text>
      )}

      {item.status === 'COUNTER_OFFERED' && item.counterPrice && (
        <View className="bg-warning/10 border border-warning/30 rounded-xl p-3 gap-1">
          <Text className="text-warning text-sm font-semibold">
            Contre-offre du client : {formatPrice(item.counterPrice)}
          </Text>
          {item.counterMessage && (
            <Text className="text-slate-400 text-xs">{item.counterMessage}</Text>
          )}
        </View>
      )}

      <View className="flex-row items-center gap-2">
        <Clock size={13} color="#64748b" />
        <Text className="text-slate-400 text-xs">{formatRelative(item.createdAt)}</Text>
      </View>

      {item.status === 'PENDING' && (
        <Button
          title="Retirer l'offre"
          variant="danger"
          size="sm"
          onPress={handleWithdraw}
          loading={withdraw.isPending}
        />
      )}
    </View>
  );
}

export default function MyOffersScreen() {
  const { data: offers, isLoading, refetch } = useMyOffers();

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Mes offres envoyées" back />
      {isLoading && !offers ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={offers ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#3b82f6" />
          }
          ListEmptyComponent={
            <EmptyState
              icon="📤"
              title="Aucune offre envoyée"
              subtitle="Parcourez les demandes pour envoyer vos premières offres."
            />
          }
          renderItem={({ item }) => <OfferCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}
