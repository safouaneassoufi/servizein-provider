import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useRegister } from '@/hooks/useAuth';

const schema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  phone: z
    .string()
    .regex(/^\+212[5-7]\d{8}$/, 'Numéro marocain invalide (+212XXXXXXXXX)'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

type Form = z.infer<typeof schema>;

export default function RegisterScreen() {
  const register = useRegister();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await register.mutateAsync({ ...data, role: 'PROVIDER' });
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: data.phone, purpose: 'REGISTER' },
      });
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Erreur lors de l\'inscription');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Créer un compte" back />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4 mt-4">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Prénom"
                placeholder="Mohammed"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.firstName?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Nom"
                placeholder="Alami"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Téléphone"
                placeholder="+212612345678"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Mot de passe"
                placeholder="••••••••"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />
        </View>

        <Text className="text-slate-400 text-xs text-center leading-5">
          En vous inscrivant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
        </Text>

        <Button
          title="Créer mon compte"
          onPress={handleSubmit(onSubmit)}
          loading={register.isPending}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
