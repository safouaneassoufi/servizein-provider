import { ScrollView, Text, View, Image, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MapPin, Clock, Tag, User, AlertCircle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge, requestStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime, formatRelative } from '@/utils/format';
import { useProviderStore } from '@/store/provider.store';
import type { ServiceRequest } from '@/types';

function useRequest(id: string) {
  return useQuery({
    queryKey: ['requests', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ServiceRequest>(`/requests/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: request, isLoading, error } = useRequest(id);
  const { profile } = useProviderStore();

  const kycApproved = profile?.kycStatus === 'APPROVED';
  const canSendOffer = kycApproved && request?.status === 'OPEN';

  if (isLoading) return <LoadingSpinner full />;
  if (error || !request) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <ScreenHeader title="Demande" back />
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-400">Demande introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const badge = requestStatusBadge(request.status);

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      <ScreenHeader title="Détail de la demande" back />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Catégorie + statut ─────────────── */}
        <View className="bg-slate-800 rounded-2xl p-4" style={{ gap: 10 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Tag size={14} color="#64748b" />
              <Text className="text-accent text-sm font-medium">
                {request.category?.name}
              </Text>
            </View>
            <Badge {...badge} />
          </View>
          <Text className="text-white text-base leading-6">{request.description}</Text>
          <Text className="text-slate-500 text-xs">
            {request.offerCount} offre{request.offerCount !== 1 ? 's' : ''} reçue
            {request.offerCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* ─── Client ─────────────────────────── */}
        <View className="bg-slate-800 rounded-2xl p-4" style={{ gap: 10 }}>
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
            Client
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-slate-700 items-center justify-center">
              <User size={18} color="#94a3b8" />
            </View>
            <Text className="text-white font-semibold">
              {request.client?.firstName} {request.client?.lastName}
            </Text>
          </View>
        </View>

        {/* ─── Infos ──────────────────────────── */}
        <View className="bg-slate-800 rounded-2xl p-4" style={{ gap: 10 }}>
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
            Informations
          </Text>
          {request.city ? (
            <View className="flex-row items-center gap-2">
              <MapPin size={15} color="#64748b" />
              <Text className="text-white">{request.city}</Text>
            </View>
          ) : null}
          <View className="flex-row items-center gap-2">
            <Clock size={15} color="#64748b" />
            <Text className="text-white">
              Publiée {formatRelative(request.createdAt)}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Clock size={15} color="#64748b" />
            <Text className="text-slate-400 text-sm">
              Expire {formatRelative(request.expiresAt)}
            </Text>
          </View>
        </View>

        {/* ─── Photos ─────────────────────────── */}
        {request.photoUrls?.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wide px-1">
              Photos ({request.photoUrls.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {request.photoUrls.map((url, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: url }}
                    style={{ width: 100, height: 100, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* ─── KYC warning ────────────────────── */}
        {!kycApproved && (
          <View className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex-row items-center gap-3">
            <AlertCircle size={18} color="#f59e0b" />
            <Text className="flex-1 text-amber-400 text-sm leading-5">
              Votre compte doit être vérifié (KYC) pour envoyer des offres.
            </Text>
          </View>
        )}

        {/* ─── CTA ────────────────────────────── */}
        {request.status === 'OPEN' && (
          <Button
            title={
              canSendOffer
                ? 'Envoyer une offre'
                : 'KYC requis pour envoyer une offre'
            }
            disabled={!canSendOffer}
            size="lg"
            onPress={() =>
              router.push(`/(app)/(requests)/offer/${request.id}` as any)
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
