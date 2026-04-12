import { useState } from 'react';
import { Alert, FlatList, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAddService } from '@/hooks/useProvider';

const CATEGORIES = [
  { id: 'cat_plomberie', name: 'Plomberie', icon: '🔧' },
  { id: 'cat_electricite', name: 'Électricité', icon: '⚡' },
  { id: 'cat_peinture', name: 'Peinture', icon: '🎨' },
  { id: 'cat_menage', name: 'Ménage', icon: '🧹' },
  { id: 'cat_jardinage', name: 'Jardinage', icon: '🌿' },
  { id: 'cat_climatisation', name: 'Climatisation', icon: '❄️' },
  { id: 'cat_demenagement', name: 'Déménagement', icon: '📦' },
  { id: 'cat_informatique', name: 'Informatique', icon: '💻' },
  { id: 'cat_maconnerie', name: 'Maçonnerie', icon: '🧱' },
  { id: 'cat_vitrerie', name: 'Vitrerie', icon: '🪟' },
  { id: 'cat_menuiserie', name: 'Menuiserie', icon: '🪵' },
  { id: 'cat_serrurerie', name: 'Serrurerie', icon: '🔑' },
];

export default function ServicesScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const addService = useAddService();

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleNext = async () => {
    if (selected.length === 0) {
      Alert.alert('Sélectionnez au moins un service');
      return;
    }
    setLoading(true);
    try {
      await Promise.all(selected.map((id) => addService.mutateAsync({ categoryId: id })));
      router.push('/(onboarding)/zone');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Progress */}
      <View className="px-6 pt-4 gap-3">
        <View className="flex-row gap-1">
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              className={`h-1 flex-1 rounded-full ${step <= 2 ? 'bg-accent' : 'bg-slate-700'}`}
            />
          ))}
        </View>
        <Text className="text-slate-400 text-sm">Étape 2 sur 5 — Vos services</Text>
      </View>

      <View className="flex-1 px-6 mt-6 gap-4">
        <View>
          <Text className="text-white text-2xl font-bold">Vos spécialités</Text>
          <Text className="text-slate-400 mt-1">
            Sélectionnez les services que vous proposez. ({selected.length} sélectionné
            {selected.length !== 1 ? 's' : ''})
          </Text>
        </View>

        <FlatList
          data={CATEGORIES}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => {
            const isSelected = selected.includes(item.id);
            return (
              <Pressable
                onPress={() => toggle(item.id)}
                className={`flex-1 rounded-2xl p-4 items-center gap-2 border-2 ${
                  isSelected
                    ? 'bg-accent/20 border-accent'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <Text className="text-3xl">{item.icon}</Text>
                <Text
                  className={`text-sm font-medium text-center ${
                    isSelected ? 'text-accent' : 'text-white'
                  }`}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
        />

        <Button
          title="Continuer"
          onPress={handleNext}
          loading={loading}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
