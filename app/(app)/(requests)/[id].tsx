import { ScrollView, Text, View, Image, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MapPin, Clock, Tag, User, Images } from 'lucide-react-native';
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
  const { data: request, isLoading } = useRequest(id);
  const { profile } = useProviderStore();

  const canSendOffer =
    profile?.kycStatus === 'APPROVED' && request?.status === 'OPEN';

  if (isLoading) return <LoadingSpinner full />;
  if (!request) return null;

  const badge = requestStatusBadge(request.status);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Détail de la demande" back />
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Header */}
        <View className="bg-slate-800 rounded-2xl p-4 gap-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-center gap-2">
              <Tag size={14} color="#64748b" />
              <Text className="text-slate-400 text-sm">{request.category?.name}</Text>
            </View>
            <Badge {...badge} />
          </View>
          <Text className="text-white text-base leading-6">{request.description}</Text>
        </View>

        {/* Client info */}
        <View className="bg-slate-800 rounded-2xl p-4 gap-3">
          <Text className="text-slate-400 text-sm font-medium">Client</Text>
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-slate-700 items-center justify-center">
              <User size={18} color="#94a3b8" />
            </View>
            <Text className="text-white font-semibold">
              {request.client?.firstName} {request.client?.lastName}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View className="bg-slate-800 rounded-2xl p-4 gap-4">
          <Text className="text-slate-400 text-sm font-medium">Informations</Text>
          {request.city && (
            <View className="flex-row items-center gap-2">
              <MapPin size={16} color="#64748b" />
              <Text className="text-white">{request.city}</Text>
            </View>
          )}
          <View className="flex-row items-center gap-2">
            <Clock size={16} color="#64748b" />
            <Text className="text-white">{formatDateTime(request.createdAt)}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Clock size={16} color="#64748b" />
            <Text className="text-slate-400 text-sm">
              Expire {formatRelative(request.expiresAt)}
            </Text>
          </View>
          <Text className="text-slate-400 text-sm">
            {request.offerCount} offre{request.offerCount !== 1 ? 's' : ''} reçue
            {request.offerCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Photos */}
        {request.photoUrls?.length > 0 && (
          <View className="gap-2">
            <Text className="text-slate-400 text-sm font-medium">Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {request.photoUrls.map((url, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: url }}
                    className="w-24 h-24 rounded-xl"
                    resizeMode="cover"
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* KYC warning */}
        {profile?.kycStatus !== 'APPROVED' && (
          <View className="bg-warning/10 border border-warning/30 rounded-2xl p-4">
            <Text className="text-warning text-sm">
              ⚠️ Votre compte doit être vérifié pour envoyer des offres.
            </Text>
          </View>
        )}

        {/* CTA */}
        {canSendOffer && (
          <Button
            title="Envoyer une offre"
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
