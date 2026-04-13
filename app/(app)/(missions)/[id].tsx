import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  MapPin,
  Phone,
  User,
  Wallet,
  CheckCircle,
  Circle,
  MessageSquare,
} from 'lucide-react-native';
import { useMission, useUpdateMissionStatus } from '@/hooks/useMissions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge, missionStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatPrice, formatSlot } from '@/utils/format';
import type { BookingStatus } from '@/types';

interface StatusStep {
  status: BookingStatus;
  label: string;
  description: string;
}

const TIMELINE: StatusStep[] = [
  {
    status: 'CONFIRMED',
    label: 'Mission confirmée',
    description: 'Le client a accepté votre offre',
  },
  {
    status: 'PROVIDER_EN_ROUTE',
    label: 'En route',
    description: 'Vous vous dirigez chez le client',
  },
  {
    status: 'PROVIDER_ARRIVED',
    label: 'Arrivé sur place',
    description: 'Vous êtes chez le client',
  },
  {
    status: 'IN_PROGRESS',
    label: 'Mission en cours',
    description: 'L\'intervention est démarrée',
  },
  {
    status: 'COMPLETED',
    label: 'Mission terminée',
    description: 'L\'intervention est terminée avec succès',
  },
];

const STATUS_ORDER: BookingStatus[] = [
  'CONFIRMED',
  'PROVIDER_EN_ROUTE',
  'PROVIDER_ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
];

const NEXT_ACTION: Partial<Record<BookingStatus, { cta: string; next: BookingStatus }>> = {
  CONFIRMED: { cta: '🚗  Je suis en route', next: 'PROVIDER_EN_ROUTE' },
  PROVIDER_EN_ROUTE: { cta: '📍  Je suis arrivé', next: 'PROVIDER_ARRIVED' },
  PROVIDER_ARRIVED: { cta: '🔧  Démarrer la mission', next: 'IN_PROGRESS' },
  IN_PROGRESS: { cta: '✅  Terminer la mission', next: 'COMPLETED' },
};

export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: mission, isLoading } = useMission(id);
  const updateStatus = useUpdateMissionStatus();

  if (isLoading) return <LoadingSpinner full />;
  if (!mission) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <ScreenHeader title="Mission" back />
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-400">Mission introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const badge = missionStatusBadge(mission.status);
  const nextAction = NEXT_ACTION[mission.status as BookingStatus];
  const currentIdx = STATUS_ORDER.indexOf(mission.status as BookingStatus);
  const isCancelled = mission.status === 'CANCELLED' || mission.status === 'DISPUTED';

  const handleStatusUpdate = () => {
    if (!nextAction) return;
    Alert.alert('Confirmer', nextAction.cta + ' ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Confirmer',
        onPress: () =>
          updateStatus.mutate(
            { id: mission.id, status: nextAction.next },
            {
              onError: () =>
                Alert.alert('Erreur', 'Impossible de mettre à jour'),
            },
          ),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      <ScreenHeader
        title="Mission"
        back
        right={
          <Pressable
            onPress={() => router.push(`/(app)/(messages)/${mission.id}` as any)}
            className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
          >
            <MessageSquare size={18} color="#3b82f6" />
          </Pressable>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Statut ──────────────────────────── */}
        <View className="bg-slate-800 rounded-2xl p-4 flex-row items-center justify-between">
          <View>
            <Text className="text-slate-400 text-xs mb-1">Statut actuel</Text>
            <Badge {...badge} />
          </View>
          <Text className="text-slate-400 text-xs">{mission.category?.name}</Text>
        </View>

        {/* ─── Timeline ────────────────────────── */}
        {!isCancelled && (
          <View className="bg-slate-800 rounded-2xl p-4" style={{ gap: 0 }}>
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">
              Progression
            </Text>
            {TIMELINE.map((step, idx) => {
              const done = idx < currentIdx;
              const active = idx === currentIdx;
              const pending = idx > currentIdx;
              return (
                <View key={step.status} className="flex-row gap-3">
                  {/* Line + dot */}
                  <View className="items-center" style={{ width: 24 }}>
                    {done ? (
                      <CheckCircle size={20} color="#22c55e" fill="#22c55e" />
                    ) : active ? (
                      <View className="w-5 h-5 rounded-full bg-accent items-center justify-center">
                        <View className="w-2 h-2 rounded-full bg-white" />
                      </View>
                    ) : (
                      <Circle size={20} color="#334155" />
                    )}
                    {idx < TIMELINE.length - 1 && (
                      <View
                        className={`w-0.5 flex-1 my-1 ${
                          done ? 'bg-success' : 'bg-slate-700'
                        }`}
                        style={{ minHeight: 20 }}
                      />
                    )}
                  </View>
                  {/* Text */}
                  <View className="flex-1 pb-3">
                    <Text
                      className={`font-medium text-sm ${
                        done
                          ? 'text-success'
                          : active
                          ? 'text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </Text>
                    {active && (
                      <Text className="text-slate-400 text-xs mt-0.5">
                        {step.description}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ─── Client ──────────────────────────── */}
        <View className="bg-slate-800 rounded-2xl p-4" style={{ gap: 10 }}>
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
            Client
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-slate-700 items-center justify-center">
                <User size={18} color="#94a3b8" />
              </View>
              <Text className="text-white font-semibold">
                {mission.client?.name ?? 'Client'}
              </Text>
            </View>
            <Pressable className="w-9 h-9 rounded-full bg-accent/20 items-center justify-center">
              <Phone size={16} color="#3b82f6" />
            </Pressable>
          </View>
        </View>

        {/* ─── Détails intervention ────────────── */}
        <View className="bg-slate-800 rounded-2xl p-4" style={{ gap: 10 }}>
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
            Intervention
          </Text>
          <View className="flex-row items-center gap-2">
            <Calendar size={15} color="#64748b" />
            <Text className="text-white">
              {formatDate(mission.scheduledDate, 'EEEE dd MMMM yyyy')}
            </Text>
          </View>
          {mission.slot ? (
            <View className="flex-row items-center gap-2">
              <Calendar size={15} color="#64748b" />
              <Text className="text-white">{formatSlot(mission.slot)}</Text>
            </View>
          ) : null}
          {mission.address ? (
            <View className="flex-row items-start gap-2">
              <MapPin size={15} color="#64748b" />
              <Text className="flex-1 text-white leading-5">
                {typeof mission.address === 'string'
                  ? mission.address
                  : `${mission.address.line1}, ${mission.address.city}`}
              </Text>
            </View>
          ) : null}
          {mission.notes ? (
            <Text className="text-slate-400 text-sm leading-5 italic">
              "{mission.notes}"
            </Text>
          ) : null}
        </View>

        {/* ─── Paiement ────────────────────────── */}
        <View className="bg-slate-800 rounded-2xl p-4" style={{ gap: 10 }}>
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
            Paiement
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-400 text-sm">Montant client</Text>
            <Text className="text-white">{formatPrice(mission.totalAmount)}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-400 text-sm">Commission (5%)</Text>
            <Text className="text-danger text-sm">
              -{formatPrice(mission.platformFee)}
            </Text>
          </View>
          <View className="h-px bg-slate-700" />
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Wallet size={16} color="#22c55e" />
              <Text className="text-white font-bold">Vous recevez</Text>
            </View>
            <Text className="text-success font-bold text-lg">
              {formatPrice(mission.providerAmount)}
            </Text>
          </View>
        </View>

        {/* ─── Terminée ────────────────────────── */}
        {mission.status === 'COMPLETED' && (
          <View className="bg-success/10 border border-success/30 rounded-2xl p-4">
            <Text className="text-success font-semibold text-center">
              ✓ Mission terminée — Paiement en cours de traitement (48h)
            </Text>
          </View>
        )}

        {/* ─── Annulée / Litige ────────────────── */}
        {isCancelled && (
          <View className="bg-danger/10 border border-danger/30 rounded-2xl p-4">
            <Text className="text-danger font-semibold text-center">
              {mission.status === 'DISPUTED'
                ? '⚠️ Mission en litige — Contactez le support'
                : '✗ Mission annulée'}
            </Text>
          </View>
        )}

        {/* ─── CTA ─────────────────────────────── */}
        {nextAction && (
          <Button
            title={nextAction.cta}
            onPress={handleStatusUpdate}
            loading={updateStatus.isPending}
            size="lg"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
