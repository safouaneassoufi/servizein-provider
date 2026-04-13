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
  name: z.string().min(3, 'Nom complet requis (min 3 caractères)'),
  phone: z
    .string()
    .regex(/^\+212[0-9]{9}$/, 'Format requis : +212XXXXXXXXX'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

type Form = z.infer<typeof schema>;

export default function RegisterScreen() {
  const register = useRegister();
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await register.mutateAsync({ name: data.name, phone: data.phone, password: data.password });
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: data.phone, purpose: 'REGISTER' },
      } as any);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Erreur d\'inscription';
      Alert.alert('Erreur', Array.isArray(msg) ? msg.join('\n') : msg);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Créer un compte" back />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ gap: 16, paddingTop: 12, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Nom complet"
              placeholder="Mohammed Alami"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
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
              placeholder="Minimum 8 caractères"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />

        <Text className="text-slate-400 text-xs text-center leading-5">
          En vous inscrivant, vous acceptez nos Conditions d'utilisation.
        </Text>

        <Button
          title="Créer mon compte"
          onPress={handleSubmit(onSubmit)}
          loading={register.isPending}
          size="lg"
        />

        <Button
          title="J'ai déjà un compte"
          variant="ghost"
          onPress={() => router.replace('/(auth)/login')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
