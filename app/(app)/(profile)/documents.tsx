import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useProviderStore } from '@/store/provider.store';
import { Badge } from '@/components/ui/Badge';
import type { KycStatus } from '@/types';

function kycBadgeVariant(status: KycStatus) {
  return status === 'APPROVED'
    ? 'success'
    : status === 'REJECTED'
    ? 'danger'
    : 'warning';
}

function kycLabel(status: KycStatus) {
  const map: Record<KycStatus, string> = {
    PENDING: 'En attente d\'envoi',
    UNDER_REVIEW: 'En cours d\'examen',
    APPROVED: 'Approuvé',
    REJECTED: 'Rejeté',
  };
  return map[status];
}

export default function DocumentsScreen() {
  const { profile } = useProviderStore();
  const status = profile?.kycStatus ?? 'PENDING';

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Documents KYC" back />
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ gap: 16, paddingVertical: 16 }}>
        {/* Status card */}
        <View className="bg-slate-800 rounded-2xl p-4 gap-3">
          <Text className="text-white font-semibold">Statut de vérification</Text>
          <View className="flex-row items-center gap-2">
            <Badge label={kycLabel(status as KycStatus)} variant={kycBadgeVariant(status as KycStatus)} />
          </View>
          {status === 'REJECTED' && (
            <Text className="text-danger text-sm">
              Votre dossier a été rejeté. Veuillez soumettre de nouveau vos documents.
            </Text>
          )}
          {status === 'UNDER_REVIEW' && (
            <Text className="text-slate-400 text-sm">
              Votre dossier est en cours d'examen. Délai : 24-48h ouvrables.
            </Text>
          )}
          {status === 'APPROVED' && (
            <Text className="text-success text-sm">
              ✓ Votre identité est vérifiée. Vous pouvez envoyer des offres.
            </Text>
          )}
        </View>

        {/* Docs */}
        {['CIN (Carte Nationale d\'Identité)', 'RIB Bancaire'].map((doc) => (
          <View key={doc} className="bg-slate-800 rounded-2xl p-4 gap-2">
            <Text className="text-white font-medium">{doc}</Text>
            <Text className="text-slate-400 text-sm">
              {status === 'APPROVED' ? '✓ Reçu et vérifié' : 'En attente de traitement'}
            </Text>
          </View>
        ))}

        {(status === 'PENDING' || status === 'REJECTED') && (
          <View className="bg-warning/10 border border-warning/30 rounded-2xl p-4">
            <Text className="text-warning text-sm leading-5">
              Pour envoyer vos documents, contactez notre support ou repassez par l'onboarding.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
