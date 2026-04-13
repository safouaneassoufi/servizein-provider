import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useSendOtp } from '@/hooks/useAuth';

const schema = z.object({
  phone: z
    .string()
    .regex(/^\+212[0-9]{9}$/, 'Format requis : +212XXXXXXXXX'),
});

type Form = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const sendOtp = useSendOtp();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await sendOtp.mutateAsync(data.phone);
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: data.phone, purpose: 'RESET_PASSWORD' },
      } as any);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Numéro introuvable';
      Alert.alert('Erreur', Array.isArray(msg) ? msg.join('\n') : msg);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Mot de passe oublié" back />
      <View className="flex-1 px-5" style={{ gap: 20, paddingTop: 16 }}>
        <Text className="text-slate-400 leading-6">
          Entrez votre numéro de téléphone enregistré. Nous vous enverrons un code de vérification.
        </Text>

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

        <Button
          title="Envoyer le code"
          onPress={handleSubmit(onSubmit)}
          loading={sendOtp.isPending}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
