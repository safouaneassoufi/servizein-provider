import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, ScrollView, TextInput, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUpdateProvider } from '@/hooks/useProvider';

const CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger',
  'Agadir', 'Meknès', 'Oujda', 'Kenitra', 'Salé',
];

const schema = z.object({
  bio: z.string().min(20, 'Minimum 20 caractères').max(500),
  experience: z.coerce.number().min(0).max(50),
  city: z.string().min(1, 'Ville requise'),
});

type Form = z.infer<typeof schema>;

export default function IdentityScreen() {
  const updateProvider = useUpdateProvider();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await updateProvider.mutateAsync(data);
      router.push('/(onboarding)/services');
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
              className={`h-1 flex-1 rounded-full ${step === 1 ? 'bg-accent' : 'bg-slate-700'}`}
            />
          ))}
        </View>
        <Text className="text-slate-400 text-sm">Étape 1 sur 5 — Votre profil</Text>
      </View>

      <ScrollView
        className="flex-1 px-6 mt-6"
        contentContainerStyle={{ gap: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text className="text-white text-2xl font-bold">Présentez-vous</Text>
          <Text className="text-slate-400 mt-1">
            Ces informations seront visibles par vos clients potentiels.
          </Text>
        </View>

        <View className="gap-4">
          <Controller
            control={control}
            name="bio"
            render={({ field: { value, onChange, onBlur } }) => (
              <View className="gap-1.5">
                <Text className="text-slate-300 text-sm font-medium">Présentation</Text>
                <View className={`bg-slate-800 border rounded-xl px-4 py-3 ${errors.bio ? 'border-danger' : 'border-slate-700'}`}>
                  <TextInput
                    className="text-white text-base"
                    placeholder="Décrivez votre expérience et vos compétences..."
                    placeholderTextColor="#64748b"
                    multiline
                    numberOfLines={4}
                    style={{ minHeight: 100 }}
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </View>
                {errors.bio && (
                  <Text className="text-danger text-xs">{errors.bio.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="experience"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Années d'expérience"
                placeholder="5"
                keyboardType="number-pad"
                value={value?.toString() ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.experience?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="city"
            render={({ field: { value, onChange } }) => (
              <View className="gap-1.5">
                <Text className="text-slate-300 text-sm font-medium">Ville principale</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {CITIES.map((city) => (
                      <Button
                        key={city}
                        title={city}
                        variant={value === city ? 'primary' : 'outline'}
                        size="sm"
                        onPress={() => onChange(city)}
                      />
                    ))}
                  </View>
                </ScrollView>
                {errors.city && (
                  <Text className="text-danger text-xs">{errors.city.message}</Text>
                )}
              </View>
            )}
          />
        </View>

        <Button
          title="Continuer"
          onPress={handleSubmit(onSubmit)}
          loading={updateProvider.isPending}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
