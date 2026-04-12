import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useSetAvailability } from '@/hooks/useProvider';
import type { AvailabilityRule } from '@/types';

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const DEFAULT_RULES: AvailabilityRule[] = [
  { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
  { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
  { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
  { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
  { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
];

export default function AvailabilityScreen() {
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const setAvailability = useSetAvailability();

  const toggleDay = (day: number) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleNext = async () => {
    if (activeDays.length === 0) {
      Alert.alert('Sélectionnez au moins un jour');
      return;
    }
    const rules: AvailabilityRule[] = activeDays.map((day) => ({
      dayOfWeek: day,
      startTime: '08:00',
      endTime: '18:00',
    }));
    try {
      await setAvailability.mutateAsync(rules);
      router.push('/(onboarding)/documents');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
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
              className={`h-1 flex-1 rounded-full ${step <= 4 ? 'bg-accent' : 'bg-slate-700'}`}
            />
          ))}
        </View>
        <Text className="text-slate-400 text-sm">Étape 4 sur 5 — Disponibilités</Text>
      </View>

      <ScrollView className="flex-1 px-6 mt-6" contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
        <View>
          <Text className="text-white text-2xl font-bold">Vos disponibilités</Text>
          <Text className="text-slate-400 mt-1">
            Sélectionnez les jours où vous êtes disponible (horaires 8h-18h par défaut).
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-3">
          {DAYS.map((day, idx) => {
            const isActive = activeDays.includes(idx);
            return (
              <Pressable
                key={day}
                onPress={() => toggleDay(idx)}
                className={`w-16 h-16 rounded-2xl items-center justify-center border-2 ${
                  isActive ? 'bg-accent/20 border-accent' : 'bg-slate-800 border-slate-700'
                }`}
              >
                <Text className={`text-sm font-semibold ${isActive ? 'text-accent' : 'text-slate-400'}`}>
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="bg-slate-800 rounded-2xl p-4 gap-2">
          <Text className="text-slate-400 text-sm">
            ℹ️ Vous pouvez modifier vos disponibilités à tout moment depuis votre profil.
          </Text>
        </View>

        <Button
          title="Continuer"
          onPress={handleNext}
          loading={setAvailability.isPending}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
