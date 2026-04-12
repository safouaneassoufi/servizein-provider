import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/api/client';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Requis'),
    newPassword: z.string().min(8, 'Minimum 8 caractères'),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm'],
  });

type Form = z.infer<typeof schema>;

export default function SettingsScreen() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await apiClient.put('/users/me/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      Alert.alert('Mot de passe modifié !');
      reset();
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Mot de passe actuel incorrect');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Paramètres" back />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ gap: 24, paddingVertical: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Change password */}
        <View className="gap-4">
          <Text className="text-white font-semibold text-base">Changer de mot de passe</Text>
          <View className="bg-slate-800 rounded-2xl p-4 gap-4">
            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Mot de passe actuel"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.currentPassword?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Nouveau mot de passe"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.newPassword?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirm"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Confirmer"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirm?.message}
                />
              )}
            />
            <Button
              title="Mettre à jour"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
            />
          </View>
        </View>

        {/* App info */}
        <View className="bg-slate-800 rounded-2xl p-4 gap-2">
          <Text className="text-slate-400 text-sm">Version de l'application</Text>
          <Text className="text-white">ServiZein Pro v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
