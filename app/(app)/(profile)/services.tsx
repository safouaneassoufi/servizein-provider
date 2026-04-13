import { Alert, FlatList, Pressable, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2 } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProviderProfile } from '@/hooks/useAuth';
import { useToggleService, useDeleteService } from '@/hooks/useProvider';
import type { ProviderService } from '@/types';

export default function ServicesScreen() {
  const { data: profile, isLoading } = useProviderProfile();
  const toggleService = useToggleService();
  const deleteService = useDeleteService();

  const handleDelete = (service: ProviderService) => {
    Alert.alert('Supprimer ce service ?', service.category?.name, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => deleteService.mutate(service.id),
      },
    ]);
  };

  if (isLoading) return <LoadingSpinner full />;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Mes services" back />

      <FlatList
        data={profile?.services ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <EmptyState
            icon="🔧"
            title="Aucun service"
            subtitle="Ajoutez des services depuis l'onboarding."
          />
        }
        renderItem={({ item }) => (
          <View className="bg-slate-800 rounded-2xl p-4 flex-row items-center gap-3">
            <View className="flex-1">
              <Text className="text-white font-semibold">{item.category?.name}</Text>
              {item.price ? (
                <Text className="text-slate-400 text-sm">
                  Prix : {item.price} MAD
                </Text>
              ) : (
                <Text className="text-slate-500 text-xs">Sur devis</Text>
              )}
            </View>
            <Switch
              value={item.active}
              onValueChange={() => toggleService.mutate(item.id)}
              trackColor={{ false: '#334155', true: '#3b82f6' }}
            />
            <Pressable
              onPress={() => handleDelete(item)}
              className="w-8 h-8 items-center justify-center"
            >
              <Trash2 size={18} color="#ef4444" />
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
