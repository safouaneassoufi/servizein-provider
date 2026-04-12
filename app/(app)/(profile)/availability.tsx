import { useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAvailability, useSetAvailability } from '@/hooks/useProvider';

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function AvailabilityScreen() {
  const { data: rules, isLoading } = useAvailability();
  const setAvailability = useSetAvailability();
  const [activeDays, setActiveDays] = useState<number[]>([]);

  useEffect(() => {
    if (rules) {
      setActiveDays(rules.map((r) => r.dayOfWeek));
    }
  }, [rules]);

  const toggleDay = (day: number) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSave = async () => {
    if (activeDays.length === 0) {
      Alert.alert('Sélectionnez au moins un jour');
      return;
    }
    try {
      await setAvailability.mutateAsync(
        activeDays.map((day) => ({
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '18:00',
        })),
      );
      Alert.alert('Disponibilités mises à jour !');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    }
  };

  if (isLoading) return <LoadingSpinner full />;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Disponibilités" back />
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ gap: 16, paddingVertical: 16 }}>
        <Text className="text-slate-400 text-sm">
          Sélectionnez vos jours de disponibilité (8h-18h).
        </Text>
        <View className="gap-2">
          {DAYS.map((day, idx) => {
            const isActive = activeDays.includes(idx);
            return (
              <Pressable
                key={day}
                onPress={() => toggleDay(idx)}
                className={`flex-row items-center justify-between p-4 rounded-2xl border-2 ${
                  isActive
                    ? 'bg-accent/20 border-accent'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <Text className={`font-medium ${isActive ? 'text-accent' : 'text-white'}`}>
                  {day}
                </Text>
                {isActive && (
                  <Text className="text-slate-400 text-sm">08:00 – 18:00</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Button
          title="Sauvegarder"
          onPress={handleSave}
          loading={setAvailability.isPending}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
