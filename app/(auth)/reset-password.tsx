import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

const schema = z
  .object({
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm'],
  });

type Form = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const { phone, code } = useLocalSearchParams<{ phone: string; code: string }>();
  const { setTokens } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      const tokens = await authApi.resetPassword(phone, code, data.password);
      await setTokens(tokens);
      router.replace('/(app)/(dashboard)');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Code expiré ou invalide');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Nouveau mot de passe" back />
      <View className="flex-1 px-6 gap-6 mt-6">
        <Text className="text-slate-400 leading-6">
          Choisissez un nouveau mot de passe sécurisé pour votre compte.
        </Text>

        <View className="gap-4">
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Nouveau mot de passe"
                placeholder="••••••••"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirm"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirm?.message}
              />
            )}
          />
        </View>

        <Button
          title="Réinitialiser"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
