import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useProviderStats } from '@/hooks/useProvider';
import { formatPrice } from '@/utils/format';

export default function EarningsScreen() {
  const { data: stats, isLoading, refetch } = useProviderStats();

  if (isLoading && !stats) return <LoadingSpinner full />;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Mes gains" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ gap: 16, paddingVertical: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#3b82f6" />
        }
      >
        {stats && (
          <>
            {/* Main balance */}
            <View className="bg-accent rounded-3xl p-6 items-center gap-2">
              <Text className="text-white/70 text-sm">Total cumulé</Text>
              <Text className="text-white text-4xl font-bold">
                {formatPrice(stats.totalEarnings)}
              </Text>
            </View>

            {/* Month */}
            <View className="bg-slate-800 rounded-2xl p-4 flex-row items-center justify-between">
              <View>
                <Text className="text-slate-400 text-sm">Ce mois-ci</Text>
                <Text className="text-white text-xl font-bold mt-1">
                  {formatPrice(stats.monthlyEarnings)}
                </Text>
              </View>
              <Text className="text-3xl">📈</Text>
            </View>

            {/* Summary */}
            <View className="bg-slate-800 rounded-2xl p-4 gap-4">
              <Text className="text-white font-semibold">Résumé</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-400">Missions terminées</Text>
                <Text className="text-white font-bold">{stats.completedJobs}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-400">Commission plateforme (5%)</Text>
                <Text className="text-danger">
                  -{formatPrice(stats.totalEarnings * 0.05)}
                </Text>
              </View>
              <View className="h-px bg-slate-700" />
              <View className="flex-row items-center justify-between">
                <Text className="text-white font-semibold">Net perçu</Text>
                <Text className="text-success font-bold text-lg">
                  {formatPrice(stats.totalEarnings)}
                </Text>
              </View>
            </View>

            <View className="bg-slate-800 rounded-2xl p-4">
              <Text className="text-slate-400 text-sm text-center">
                Les paiements sont versés sur votre RIB dans les 48h après validation de la mission.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
