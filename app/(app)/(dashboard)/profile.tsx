import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronRight, Settings, Star, Briefcase, FileText,
  Clock, LogOut, Edit2, Send, TrendingUp, ToggleLeft,
} from 'lucide-react-native';
import { useProviderStore } from '@/store/provider.store';
import { useLogout } from '@/hooks/useAuth';
import { useUpdateProvider } from '@/hooks/useProvider';
import { Badge } from '@/components/ui/Badge';
import { formatRating, userName, userInitials } from '@/utils/format';
import type { KycStatus } from '@/types';

function kycProps(s: KycStatus): { label: string; variant: 'success' | 'warning' | 'danger' } {
  if (s === 'APPROVED') return { label: '✓ Vérifié', variant: 'success' };
  if (s === 'REJECTED') return { label: '✗ Rejeté', variant: 'danger' };
  if (s === 'UNDER_REVIEW') return { label: 'En examen', variant: 'warning' };
  return { label: 'Non vérifié', variant: 'warning' };
}

function MenuRow({
  icon, label, sublabel, onPress, rightEl,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightEl?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 border-b border-slate-700/50 gap-3"
    >
      <View className="w-9 h-9 rounded-xl bg-slate-700 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-white font-medium">{label}</Text>
        {sublabel ? <Text className="text-slate-400 text-xs mt-0.5">{sublabel}</Text> : null}
      </View>
      {rightEl ?? <ChevronRight size={16} color="#475569" />}
    </Pressable>
  );
}

export default function ProfileTab() {
  const { profile } = useProviderStore();
  const logout = useLogout();
  const updateProvider = useUpdateProvider();

  const kycStatus = (profile?.kycStatus ?? 'PENDING') as KycStatus;
  const kyc = kycProps(kycStatus);

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Avatar */}
        <View className="items-center pt-6 pb-5 px-5" style={{ gap: 10 }}>
          <View className="w-20 h-20 rounded-full bg-accent items-center justify-center">
            <Text className="text-white text-3xl font-bold">
              {userInitials(profile?.user)}
            </Text>
          </View>
          <View className="items-center" style={{ gap: 4 }}>
            <Text className="text-white text-xl font-bold">
              {userName(profile?.user)}
            </Text>
            <Text className="text-slate-400 text-sm">{profile?.user?.phone ?? ''}</Text>
            <Badge label={kyc.label} variant={kyc.variant} />
          </View>

          {/* Stats row */}
          <View className="flex-row bg-slate-800 rounded-2xl px-6 py-3" style={{ gap: 20 }}>
            <View className="items-center">
              <Text className="text-white font-bold text-lg">
                ⭐ {formatRating(profile?.averageRating ?? 0)}
              </Text>
              <Text className="text-slate-400 text-xs">{profile?.reviewCount ?? 0} avis</Text>
            </View>
            <View className="w-px bg-slate-700" />
            <View className="items-center">
              <Text className="text-white font-bold text-lg">{profile?.completedJobs ?? 0}</Text>
              <Text className="text-slate-400 text-xs">missions</Text>
            </View>
            {profile?.experience ? (
              <>
                <View className="w-px bg-slate-700" />
                <View className="items-center">
                  <Text className="text-white font-bold text-lg">{profile.experience}</Text>
                  <Text className="text-slate-400 text-xs">ans exp.</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* Disponibilité toggle */}
        <View className="mx-4 mb-4 bg-slate-800 rounded-2xl overflow-hidden">
          <MenuRow
            icon={<ToggleLeft size={16} color="#22c55e" />}
            label="Disponible"
            sublabel={
              profile?.available
                ? 'Vous acceptez de nouvelles demandes'
                : 'Vous n\'acceptez pas de nouvelles demandes'
            }
            rightEl={
              <Switch
                value={profile?.available ?? false}
                onValueChange={(v) => updateProvider.mutate({ available: v })}
                trackColor={{ false: '#334155', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Menu */}
        <View className="mx-4 bg-slate-800 rounded-2xl overflow-hidden mb-4">
          <MenuRow
            icon={<Edit2 size={16} color="#94a3b8" />}
            label="Modifier le profil"
            sublabel="Bio, expérience, ville"
            onPress={() => router.push('/(app)/(profile)/edit' as any)}
          />
          <MenuRow
            icon={<Briefcase size={16} color="#94a3b8" />}
            label="Mes services"
            sublabel={`${profile?.services?.length ?? 0} service(s)`}
            onPress={() => router.push('/(app)/(profile)/services' as any)}
          />
          <MenuRow
            icon={<Clock size={16} color="#94a3b8" />}
            label="Disponibilités"
            onPress={() => router.push('/(app)/(profile)/availability' as any)}
          />
          <MenuRow
            icon={<FileText size={16} color="#94a3b8" />}
            label="Documents KYC"
            sublabel={kyc.label}
            onPress={() => router.push('/(app)/(profile)/documents' as any)}
            rightEl={
              kycStatus !== 'APPROVED' ? (
                <Badge label={kyc.label} variant={kyc.variant} />
              ) : (
                <ChevronRight size={16} color="#475569" />
              )
            }
          />
          <MenuRow
            icon={<Send size={16} color="#94a3b8" />}
            label="Mes offres"
            sublabel="Suivi des offres envoyées"
            onPress={() => router.push('/(app)/(profile)/offers' as any)}
          />
          <MenuRow
            icon={<TrendingUp size={16} color="#94a3b8" />}
            label="Statistiques"
            onPress={() => router.push('/(app)/(profile)/stats' as any)}
          />
        </View>

        {/* Settings */}
        <View className="mx-4 bg-slate-800 rounded-2xl overflow-hidden mb-4">
          <MenuRow
            icon={<Settings size={16} color="#94a3b8" />}
            label="Paramètres"
            sublabel="Mot de passe, compte"
            onPress={() => router.push('/(app)/(profile)/settings' as any)}
          />
        </View>

        {/* Logout */}
        <Pressable
          onPress={() => logout.mutate()}
          disabled={logout.isPending}
          className="mx-4 flex-row items-center justify-center gap-2 py-4 rounded-2xl border border-danger/40"
        >
          <LogOut size={18} color="#ef4444" />
          <Text className="text-danger font-semibold">
            {logout.isPending ? 'Déconnexion…' : 'Se déconnecter'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
