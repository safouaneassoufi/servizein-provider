import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUpdateProvider } from '@/hooks/useProvider';

const schema = z.object({
  zone: z.string().min(5, 'Décrivez votre zone d\'intervention').max(200),
});

type Form = z.infer<typeof schema>;

export default function ZoneScreen() {
  const updateProvider = useUpdateProvider();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await updateProvider.mutateAsync({ zone: data.zone });
      router.push('/(onboarding)/availability');
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
              className={`h-1 flex-1 rounded-full ${step <= 3 ? 'bg-accent' : 'bg-slate-700'}`}
            />
          ))}
        </View>
        <Text className="text-slate-400 text-sm">Étape 3 sur 5 — Zone d'intervention</Text>
      </View>

      <View className="flex-1 px-6 mt-6 gap-6">
        <View>
          <Text className="text-white text-2xl font-bold">Zone d'intervention</Text>
          <Text className="text-slate-400 mt-1">
            Précisez les quartiers, villes ou rayon que vous couvrez.
          </Text>
        </View>

        <Controller
          control={control}
          name="zone"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Zone d'intervention"
              placeholder="Ex: Casablanca — Maarif, Gauthier, CIL et 30km autour"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.zone?.message}
              multiline
              numberOfLines={3}
            />
          )}
        />

        <View className="gap-2">
          <Text className="text-slate-400 text-sm font-medium">Exemples :</Text>
          {[
            'Casablanca — tous quartiers',
            'Rabat et Salé',
            'Marrakech — Guéliz, Hivernage',
            'Tanger — 50km de rayon',
          ].map((ex) => (
            <View key={ex} className="flex-row items-center gap-2">
              <View className="w-1.5 h-1.5 rounded-full bg-accent" />
              <Text className="text-slate-400 text-sm">{ex}</Text>
            </View>
          ))}
        </View>

        <Button
          title="Continuer"
          onPress={handleSubmit(onSubmit)}
          loading={updateProvider.isPending}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
