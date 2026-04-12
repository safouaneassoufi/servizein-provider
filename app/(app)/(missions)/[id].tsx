import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Calendar, MapPin, Phone, User, Wallet } from 'lucide-react-native';
import { useMission, useUpdateMissionStatus } from '@/hooks/useMissions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge, missionStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatPrice, formatSlot } from '@/utils/format';
import type { BookingStatus } from '@/types';

const NEXT_STATUS: Partial<Record<BookingStatus, { status: BookingStatus; label: string }>> = {
  CONFIRMED: { status: 'PROVIDER_EN_ROUTE', label: 'Je suis en route' },
  PROVIDER_EN_ROUTE: { status: 'PROVIDER_ARRIVED', label: 'Je suis arrivé' },
  PROVIDER_ARRIVED: { status: 'IN_PROGRESS', label: 'Démarrer la mission' },
  IN_PROGRESS: { status: 'COMPLETED', label: 'Terminer la mission' },
};

export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: mission, isLoading } = useMission(id);
  const updateStatus = useUpdateMissionStatus();

  if (isLoading) return <LoadingSpinner full />;
  if (!mission) return null;

  const badge = missionStatusBadge(mission.status);
  const next = NEXT_STATUS[mission.status as BookingStatus];

  const handleStatusUpdate = () => {
    if (!next) return;
    Alert.alert(
      'Confirmer',
      `Passer la mission à : "${next.label}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () =>
            updateStatus.mutate(
              { id: mission.id, status: next.status },
              {
                onError: () =>
                  Alert.alert('Erreur', 'Impossible de mettre à jour le statut'),
              },
            ),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Détail mission" back />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Status */}
        <View className="bg-slate-800 rounded-2xl p-4 flex-row items-center justify-between">
          <Text className="text-slate-400 text-sm">Statut</Text>
          <Badge {...badge} />
        </View>

        {/* Client */}
        <View className="bg-slate-800 rounded-2xl p-4 gap-4">
          <Text className="text-slate-400 text-sm font-medium">Client</Text>
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-slate-700 items-center justify-center">
              <User size={18} color="#94a3b8" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">
                {mission.client?.firstName} {mission.client?.lastName}
              </Text>
            </View>
            <View className="w-8 h-8 rounded-full bg-accent/20 items-center justify-center">
              <Phone size={14} color="#3b82f6" />
            </View>
          </View>
        </View>

        {/* Mission details */}
        <View className="bg-slate-800 rounded-2xl p-4 gap-4">
          <Text className="text-slate-400 text-sm font-medium">Détails</Text>
          <View className="flex-row items-center gap-2">
            <Calendar size={16} color="#64748b" />
            <Text className="text-white">{formatDate(mission.scheduledAt, 'EEEE dd MMMM yyyy')}</Text>
          </View>
          {mission.slot && (
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color="#64748b" />
              <Text className="text-white">{formatSlot(mission.slot)}</Text>
            </View>
          )}
          {mission.address && (
            <View className="flex-row items-center gap-2">
              <MapPin size={16} color="#64748b" />
              <Text className="text-white flex-1">{mission.address}</Text>
            </View>
          )}
          {mission.notes && (
            <Text className="text-slate-400 text-sm leading-5">{mission.notes}</Text>
          )}
        </View>

        {/* Payment */}
        <View className="bg-slate-800 rounded-2xl p-4 gap-3">
          <Text className="text-slate-400 text-sm font-medium">Paiement</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-400 text-sm">Montant total</Text>
            <Text className="text-white">{formatPrice(mission.totalAmount)}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-400 text-sm">Commission plateforme</Text>
            <Text className="text-danger">-{formatPrice(mission.platformFee)}</Text>
          </View>
          <View className="h-px bg-slate-700" />
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Wallet size={16} color="#22c55e" />
              <Text className="text-white font-semibold">Vous recevez</Text>
            </View>
            <Text className="text-success font-bold text-lg">
              {formatPrice(mission.providerAmount)}
            </Text>
          </View>
        </View>

        {/* Action */}
        {next && (
          <Button
            title={next.label}
            onPress={handleStatusUpdate}
            loading={updateStatus.isPending}
            size="lg"
          />
        )}

        {mission.status === 'COMPLETED' && (
          <View className="bg-success/10 border border-success/30 rounded-2xl p-4">
            <Text className="text-success font-semibold text-center">
              ✓ Mission terminée — Paiement en cours de traitement
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
