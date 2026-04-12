import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, TrendingUp, Briefcase, Wallet, Clock } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useProviderStats } from '@/hooks/useProvider';
import { formatPrice } from '@/utils/format';

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-4 border-b border-slate-700">
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className="text-white">{label}</Text>
      </View>
      <Text className="text-white font-bold">{value}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const { data: stats, isLoading, refetch } = useProviderStats();

  if (isLoading && !stats) return <LoadingSpinner full />;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Mes statistiques" back />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ gap: 16, paddingVertical: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#3b82f6" />
        }
      >
        {stats && (
          <View className="bg-slate-800 rounded-2xl p-4">
            <StatRow
              icon={<Star size={18} color="#fbbf24" />}
              label="Note moyenne"
              value={`${stats.rating.toFixed(1)} ⭐`}
            />
            <StatRow
              icon={<TrendingUp size={18} color="#22c55e" />}
              label="Taux d'acceptation"
              value={`${stats.acceptanceRate}%`}
            />
            <StatRow
              icon={<Briefcase size={18} color="#3b82f6" />}
              label="Missions terminées"
              value={String(stats.completedJobs)}
            />
            <StatRow
              icon={<Clock size={18} color="#f59e0b" />}
              label="Missions actives"
              value={String(stats.activeMissions)}
            />
            <StatRow
              icon={<Wallet size={18} color="#a855f7" />}
              label="Gains ce mois"
              value={formatPrice(stats.monthlyEarnings)}
            />
            <StatRow
              icon={<Wallet size={18} color="#3b82f6" />}
              label="Total des gains"
              value={formatPrice(stats.totalEarnings)}
            />
            <View className="flex-row items-center justify-between py-4">
              <View className="flex-row items-center gap-3">
                <Clock size={18} color="#64748b" />
                <Text className="text-white">Offres en attente</Text>
              </View>
              <Text className="text-white font-bold">{stats.pendingOffers}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
