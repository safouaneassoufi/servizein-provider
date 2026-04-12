import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useUpdateProvider } from '@/hooks/useProvider';
import { useProviderStore } from '@/store/provider.store';

const schema = z.object({
  bio: z.string().min(20, 'Minimum 20 caractères').max(500).optional().or(z.literal('')),
  experience: z.coerce.number().min(0).max(50).optional(),
  city: z.string().optional(),
  zone: z.string().optional(),
  available: z.boolean(),
});

type Form = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const { profile } = useProviderStore();
  const updateProvider = useUpdateProvider();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: profile?.bio ?? '',
      experience: profile?.experience ?? 0,
      city: profile?.city ?? '',
      zone: profile?.zone ?? '',
      available: profile?.available ?? true,
    },
  });

  const onSubmit = async (data: Form) => {
    try {
      await updateProvider.mutateAsync({
        bio: data.bio || undefined,
        experience: data.experience,
        city: data.city || undefined,
        zone: data.zone || undefined,
        available: data.available,
      });
      Alert.alert('Profil mis à jour !');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Erreur lors de la mise à jour');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Modifier le profil" back />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ gap: 20, paddingBottom: 40, paddingTop: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Controller
          control={control}
          name="bio"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Présentation"
              placeholder="Décrivez votre expérience..."
              multiline
              numberOfLines={4}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.bio?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="experience"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Années d'expérience"
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
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Ville principale"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />

        <Controller
          control={control}
          name="zone"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Zone d'intervention"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
            />
          )}
        />

        <Controller
          control={control}
          name="available"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row items-center justify-between bg-slate-800 rounded-2xl p-4">
              <View>
                <Text className="text-white font-medium">Disponible</Text>
                <Text className="text-slate-400 text-sm">Accepter de nouvelles demandes</Text>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: '#334155', true: '#3b82f6' }}
              />
            </View>
          )}
        />

        <Button
          title="Sauvegarder"
          onPress={handleSubmit(onSubmit)}
          loading={updateProvider.isPending}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
