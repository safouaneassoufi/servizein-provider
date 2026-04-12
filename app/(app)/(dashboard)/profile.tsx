import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronRight,
  Settings,
  Star,
  Briefcase,
  FileText,
  Clock,
  LogOut,
  Edit,
  SendHorizonal,
} from 'lucide-react-native';
import { useProviderStore } from '@/store/provider.store';
import { useLogout } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { formatRating } from '@/utils/format';

function ProfileRow({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4 border-b border-slate-700 gap-3"
    >
      <View className="w-8 h-8 rounded-lg bg-slate-700 items-center justify-center">
        {icon}
      </View>
      <Text className="flex-1 text-white font-medium">{label}</Text>
      {badge && <Badge label={badge} variant="warning" />}
      <ChevronRight size={16} color="#64748b" />
    </Pressable>
  );
}

export default function ProfileTab() {
  const { profile } = useProviderStore();
  const logout = useLogout();

  const kycVariant =
    profile?.kycStatus === 'APPROVED'
      ? 'success'
      : profile?.kycStatus === 'REJECTED'
      ? 'danger'
      : 'warning';

  const kycLabel =
    profile?.kycStatus === 'APPROVED'
      ? 'Vérifié'
      : profile?.kycStatus === 'REJECTED'
      ? 'Rejeté'
      : 'En attente';

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView>
        {/* Avatar section */}
        <View className="items-center py-6 gap-3 px-6">
          <View className="w-20 h-20 rounded-full bg-accent items-center justify-center">
            <Text className="text-white text-3xl font-bold">
              {profile?.user?.firstName?.[0] ?? '?'}
            </Text>
          </View>
          <View className="items-center gap-1">
            <Text className="text-white text-xl font-bold">
              {profile?.user?.firstName} {profile?.user?.lastName}
            </Text>
            <Text className="text-slate-400 text-sm">{profile?.user?.phone}</Text>
            <Badge label={kycLabel} variant={kycVariant} />
          </View>

          {profile?.rating != null && (
            <View className="flex-row items-center gap-4">
              <View className="items-center">
                <Text className="text-white font-bold text-lg">
                  ⭐ {formatRating(profile.rating)}
                </Text>
                <Text className="text-slate-400 text-xs">{profile.reviewCount} avis</Text>
              </View>
              <View className="w-px h-8 bg-slate-700" />
              <View className="items-center">
                <Text className="text-white font-bold text-lg">{profile.completedJobs}</Text>
                <Text className="text-slate-400 text-xs">missions</Text>
              </View>
            </View>
          )}
        </View>

        {/* Menu */}
        <View className="bg-slate-800 mx-4 rounded-2xl overflow-hidden">
          <ProfileRow
            icon={<Edit size={16} color="#94a3b8" />}
            label="Modifier mon profil"
            onPress={() => router.push('/(app)/(profile)/edit' as any)}
          />
          <ProfileRow
            icon={<Briefcase size={16} color="#94a3b8" />}
            label="Mes services"
            onPress={() => router.push('/(app)/(profile)/services' as any)}
          />
          <ProfileRow
            icon={<Clock size={16} color="#94a3b8" />}
            label="Mes disponibilités"
            onPress={() => router.push('/(app)/(profile)/availability' as any)}
          />
          <ProfileRow
            icon={<FileText size={16} color="#94a3b8" />}
            label="Documents KYC"
            onPress={() => router.push('/(app)/(profile)/documents' as any)}
            badge={profile?.kycStatus !== 'APPROVED' ? kycLabel : undefined}
          />
          <ProfileRow
            icon={<SendHorizonal size={16} color="#94a3b8" />}
            label="Mes offres envoyées"
            onPress={() => router.push('/(app)/(profile)/offers' as any)}
          />
          <ProfileRow
            icon={<Star size={16} color="#94a3b8" />}
            label="Mes statistiques"
            onPress={() => router.push('/(app)/(profile)/stats' as any)}
          />
          <ProfileRow
            icon={<Settings size={16} color="#94a3b8" />}
            label="Paramètres"
            onPress={() => router.push('/(app)/(profile)/settings' as any)}
          />
        </View>

        {/* Logout */}
        <Pressable
          onPress={() => logout.mutate()}
          className="flex-row items-center justify-center gap-2 mx-4 mt-4 mb-8 py-4 rounded-2xl border border-danger/40"
        >
          <LogOut size={18} color="#ef4444" />
          <Text className="text-danger font-semibold">Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
