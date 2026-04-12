import { RefreshControl, ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bell, Star, TrendingUp, Briefcase, ClipboardList, Wallet } from 'lucide-react-native';
import { useProviderStore } from '@/store/provider.store';
import { useProviderStats } from '@/hooks/useProvider';
import { useProviderProfile } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice } from '@/utils/format';

function StatCard({ icon, label, value, color = '#3b82f6' }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View className="flex-1 bg-slate-800 rounded-2xl p-4 gap-3">
      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        {icon}
      </View>
      <View>
        <Text className="text-white text-xl font-bold">{value}</Text>
        <Text className="text-slate-400 text-xs">{label}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { profile, stats, unreadCount } = useProviderStore();
  const { isLoading, refetch } = useProviderStats();
  const { refetch: refetchProfile } = useProviderProfile();

  const onRefresh = () => {
    refetch();
    refetchProfile();
  };

  if (isLoading && !stats) return <LoadingSpinner full />;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <View>
            <Text className="text-slate-400 text-sm">Bonjour,</Text>
            <Text className="text-white text-xl font-bold">
              {profile?.user?.firstName ?? 'Prestataire'} 👋
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(app)/(notifications)')}
            className="relative w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
          >
            <Bell size={20} color="#94a3b8" />
            {unreadCount > 0 && (
              <View className="absolute top-0 right-0 w-4 h-4 rounded-full bg-danger items-center justify-center">
                <Text className="text-white text-[10px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* KYC warning */}
        {profile?.kycStatus !== 'APPROVED' && (
          <View className="mx-6 mt-2 bg-warning/10 border border-warning/30 rounded-2xl p-4">
            <Text className="text-warning font-semibold text-sm">
              ⚠️ Compte en attente de vérification
            </Text>
            <Text className="text-slate-400 text-xs mt-1 leading-4">
              Votre KYC est {profile?.kycStatus === 'UNDER_REVIEW' ? 'en cours d\'examen' : 'en attente'}. Vous ne pouvez pas encore envoyer d'offres.
            </Text>
          </View>
        )}

        {/* Rating */}
        {stats && (
          <View className="mx-6 mt-4 bg-gradient-to-r from-accent to-blue-600 bg-accent rounded-2xl p-4 flex-row items-center justify-between">
            <View>
              <Text className="text-white text-sm opacity-80">Note globale</Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Star size={18} color="#fbbf24" fill="#fbbf24" />
                <Text className="text-white text-2xl font-bold">{stats.rating.toFixed(1)}</Text>
                <Text className="text-white/60 text-sm">({stats.reviewCount} avis)</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-white/60 text-xs">Taux d'acceptation</Text>
              <Text className="text-white text-xl font-bold">{stats.acceptanceRate}%</Text>
            </View>
          </View>
        )}

        {/* Stats grid */}
        {stats && (
          <View className="px-6 mt-4 gap-3">
            <View className="flex-row gap-3">
              <StatCard
                icon={<TrendingUp size={20} color="#22c55e" />}
                label="Gains ce mois"
                value={formatPrice(stats.monthlyEarnings)}
                color="#22c55e"
              />
              <StatCard
                icon={<Wallet size={20} color="#3b82f6" />}
                label="Total gains"
                value={formatPrice(stats.totalEarnings)}
                color="#3b82f6"
              />
            </View>
            <View className="flex-row gap-3">
              <StatCard
                icon={<Briefcase size={20} color="#f59e0b" />}
                label="Missions actives"
                value={String(stats.activeMissions)}
                color="#f59e0b"
              />
              <StatCard
                icon={<ClipboardList size={20} color="#a855f7" />}
                label="Offres en attente"
                value={String(stats.pendingOffers)}
                color="#a855f7"
              />
            </View>
          </View>
        )}

        {/* Quick actions */}
        <View className="px-6 mt-6 gap-3">
          <Text className="text-white font-semibold text-base">Actions rapides</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push('/(app)/(requests)')}
              className="flex-1 bg-slate-800 rounded-2xl p-4 items-center gap-2"
            >
              <ClipboardList size={24} color="#3b82f6" />
              <Text className="text-white text-sm font-medium text-center">Voir les demandes</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(app)/(missions)')}
              className="flex-1 bg-slate-800 rounded-2xl p-4 items-center gap-2"
            >
              <Briefcase size={24} color="#22c55e" />
              <Text className="text-white text-sm font-medium text-center">Mes missions</Text>
            </Pressable>
          </View>
        </View>

        {/* Completed jobs */}
        {stats && stats.completedJobs > 0 && (
          <View className="mx-6 mt-6 bg-slate-800 rounded-2xl p-4">
            <Text className="text-slate-400 text-sm">Total missions terminées</Text>
            <Text className="text-white text-3xl font-bold mt-1">{stats.completedJobs}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
