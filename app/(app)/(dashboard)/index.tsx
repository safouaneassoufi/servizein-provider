import { RefreshControl, ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Bell,
  TrendingUp,
  Briefcase,
  ClipboardList,
  Wallet,
  Star,
  ChevronRight,
  AlertCircle,
} from 'lucide-react-native';
import { useProviderStore } from '@/store/provider.store';
import { useProviderStats } from '@/hooks/useProvider';
import { useProviderProfile } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice } from '@/utils/format';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}

function StatCard({ icon, label, value, bg }: StatCardProps) {
  return (
    <View className="flex-1 bg-slate-800 rounded-2xl p-4" style={{ gap: 10 }}>
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </View>
      <View>
        <Text className="text-white text-xl font-bold">{value}</Text>
        <Text className="text-slate-400 text-xs mt-0.5">{label}</Text>
      </View>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-slate-800 rounded-2xl p-4 items-center"
      style={{ gap: 8 }}
    >
      {icon}
      <Text className="text-white text-xs font-medium text-center">{label}</Text>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { profile, stats, unreadCount } = useProviderStore();
  const { isLoading: statsLoading, refetch: refetchStats } = useProviderStats();
  const { isLoading: profileLoading, refetch: refetchProfile } = useProviderProfile();

  const isLoading = statsLoading || profileLoading;

  const onRefresh = () => {
    refetchStats();
    refetchProfile();
  };

  if (isLoading && !stats && !profile) return <LoadingSpinner full />;

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─────────────────────────── */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <View>
            <Text className="text-slate-400 text-sm">Bonjour,</Text>
            <Text className="text-white text-2xl font-bold">
              {profile?.user?.firstName ?? 'Prestataire'} 👋
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(app)/(notifications)/index' as any)}
            className="w-11 h-11 rounded-full bg-slate-800 items-center justify-center"
          >
            <Bell size={20} color="#94a3b8" />
            {unreadCount > 0 && (
              <View className="absolute top-0 right-0 w-4 h-4 rounded-full bg-danger items-center justify-center">
                <Text className="text-white text-[9px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* ─── Alerte KYC ──────────────────────── */}
        {profile && profile.kycStatus !== 'APPROVED' && (
          <Pressable
            onPress={() => router.push('/(app)/(profile)/documents' as any)}
            className="mx-5 mb-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex-row items-center gap-3"
          >
            <AlertCircle size={18} color="#f59e0b" />
            <View className="flex-1">
              <Text className="text-amber-400 font-semibold text-sm">
                {profile.kycStatus === 'UNDER_REVIEW'
                  ? 'Vérification en cours…'
                  : profile.kycStatus === 'REJECTED'
                  ? 'KYC rejeté — action requise'
                  : 'Finalisez votre vérification d\'identité'}
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                Requis pour envoyer des offres
              </Text>
            </View>
            <ChevronRight size={16} color="#64748b" />
          </Pressable>
        )}

        {/* ─── Note + taux ─────────────────────── */}
        {stats && (
          <View className="mx-5 mb-4 bg-accent rounded-2xl p-5 flex-row items-center justify-between">
            <View>
              <Text className="text-blue-200 text-xs mb-1">Note globale</Text>
              <View className="flex-row items-center gap-1.5">
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text className="text-white text-2xl font-bold">
                  {stats.rating.toFixed(1)}
                </Text>
                <Text className="text-blue-200 text-sm">
                  ({stats.reviewCount} avis)
                </Text>
              </View>
            </View>
            <View className="h-full w-px bg-blue-400/30 mx-2" />
            <View className="items-end">
              <Text className="text-blue-200 text-xs mb-1">Acceptation</Text>
              <Text className="text-white text-2xl font-bold">
                {stats.acceptanceRate}%
              </Text>
            </View>
            <View className="h-full w-px bg-blue-400/30 mx-2" />
            <View className="items-end">
              <Text className="text-blue-200 text-xs mb-1">Terminées</Text>
              <Text className="text-white text-2xl font-bold">
                {stats.completedJobs}
              </Text>
            </View>
          </View>
        )}

        {/* ─── Stats grid ──────────────────────── */}
        {stats && (
          <View className="px-5 gap-3 mb-4">
            <View className="flex-row gap-3">
              <StatCard
                icon={<TrendingUp size={18} color="#22c55e" />}
                label="Gains ce mois"
                value={formatPrice(stats.monthlyEarnings)}
                bg="rgba(34,197,94,0.15)"
              />
              <StatCard
                icon={<Wallet size={18} color="#3b82f6" />}
                label="Total gains"
                value={formatPrice(stats.totalEarnings)}
                bg="rgba(59,130,246,0.15)"
              />
            </View>
            <View className="flex-row gap-3">
              <StatCard
                icon={<Briefcase size={18} color="#f59e0b" />}
                label="Missions actives"
                value={String(stats.activeMissions)}
                bg="rgba(245,158,11,0.15)"
              />
              <StatCard
                icon={<ClipboardList size={18} color="#a855f7" />}
                label="Offres en attente"
                value={String(stats.pendingOffers)}
                bg="rgba(168,85,247,0.15)"
              />
            </View>
          </View>
        )}

        {/* ─── Actions rapides ─────────────────── */}
        <View className="px-5">
          <Text className="text-white font-semibold text-base mb-3">
            Actions rapides
          </Text>
          <View className="flex-row gap-3">
            <QuickAction
              icon={<ClipboardList size={22} color="#3b82f6" />}
              label="Voir les demandes"
              onPress={() => router.push('/(app)/(dashboard)/requests' as any)}
            />
            <QuickAction
              icon={<Briefcase size={22} color="#22c55e" />}
              label="Mes missions"
              onPress={() => router.push('/(app)/(dashboard)/missions' as any)}
            />
            <QuickAction
              icon={<Bell size={22} color="#f59e0b" />}
              label="Notifications"
              onPress={() => router.push('/(app)/(notifications)/index' as any)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
