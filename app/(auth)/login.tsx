import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLogin } from '@/hooks/useAuth';

const schema = z.object({
  identifier: z.string().min(1, 'Téléphone ou email requis'),
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
      const msg = e?.response?.data?.message ?? 'Identifiants incorrects';
      Alert.alert('Erreur', Array.isArray(msg) ? msg.join('\n') : msg);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Connexion" back />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ gap: 16, paddingTop: 12, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Controller
          control={control}
          name="identifier"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Téléphone ou email"
              placeholder="+212661234567"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.identifier?.message}
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

        <Pressable
          onPress={() => router.push('/(auth)/forgot-password')}
          className="items-end"
        >
          <Text className="text-accent text-sm">Mot de passe oublié ?</Text>
        </Pressable>

        <Button
          title="Se connecter"
          onPress={handleSubmit(onSubmit)}
          loading={login.isPending}
          size="lg"
        />

        {/* Dev hint */}
        <View className="bg-slate-800/60 rounded-xl p-3">
          <Text className="text-slate-500 text-xs text-center">
            🛠 Dev: <Text className="font-mono text-slate-300">+212661234567</Text> / <Text className="font-mono text-slate-300">password123</Text>
          </Text>
        </View>

        <Button
          title="Créer un compte"
          variant="ghost"
          onPress={() => router.replace('/(auth)/register')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
