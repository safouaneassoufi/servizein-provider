import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLogin } from '@/hooks/useAuth';

const schema = z.object({
  phone: z.string().min(1, 'Téléphone requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type Form = z.infer<typeof schema>;

export default function LoginScreen() {
  const login = useLogin();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await login.mutateAsync(data);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Identifiants incorrects');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Connexion" back />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4 mt-4">
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Téléphone"
                placeholder="+212661234567"
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

        <Button
          title="Mot de passe oublié ?"
          variant="ghost"
          size="sm"
          onPress={() => router.push('/(auth)/forgot-password')}
        />

        <Button
          title="Se connecter"
          onPress={handleSubmit(onSubmit)}
          loading={login.isPending}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
