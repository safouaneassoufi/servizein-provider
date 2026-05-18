import { useEffect, useRef, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { authApi } from '@/api/auth.api';
import { providerApi } from '@/api/provider.api';
import { useAuthStore } from '@/store/auth.store';
import { useProviderStore } from '@/store/provider.store';
import { registerPushToken } from '@/hooks/usePushNotifications';

export default function OtpScreen() {
  const { phone, purpose } = useLocalSearchParams<{
    phone: string;
    purpose: 'REGISTER' | 'RESET_PASSWORD';
  }>();

  const [digits, setDigits]   = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer]     = useState(60);
  const [loading, setLoading] = useState(false);
  const refs                  = useRef<(TextInput | null)[]>([]);
  const { setTokens }         = useAuthStore();
  const { setProfile }        = useProviderStore();

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const code = digits.join('');

  const handleChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) return;

    // ── RESET PASSWORD: juste rediriger avec le code ──────────────────────────
    if (purpose === 'RESET_PASSWORD') {
      router.push({
        pathname: '/(auth)/reset-password',
        params: { phone, code },
      } as any);
      return;
    }

    // ── REGISTER: vérifier OTP → tokens → setup provider → navigation ────────
    setLoading(true);
    try {
      // 1. Vérifier OTP → récupérer les tokens JWT
      const tokens = await authApi.verifyOtp(phone, code);
      await setTokens(tokens);

      // 2. Lire les données sauvegardées lors de l'inscription
      const [city, servicesStr] = await Promise.all([
        SecureStore.getItemAsync('pending_city'),
        SecureStore.getItemAsync('pending_services'),
      ]);

      // 3. Créer le compte prestataire avec la ville
      if (city) {
        try {
          await providerApi.setup({ city, bio: city || 'Prestataire ServiZein', experience: 0 });
        } catch {
          // Le compte prestataire existe peut-être déjà
        }
      }

      // 4. Ajouter les services sélectionnés (best-effort, ne bloque pas)
      if (servicesStr) {
        try {
          const svcs = JSON.parse(servicesStr) as Array<{ id: string; name: string }>;
          await Promise.allSettled(
            svcs.map((s) =>
              providerApi.addService({
                categoryId: s.id,
                name: s.name,
                priceType: 'QUOTE',
              }),
            ),
          );
        } catch {}
      }

      // 5. Nettoyer SecureStore
      await Promise.allSettled([
        SecureStore.deleteItemAsync('pending_phone'),
        SecureStore.deleteItemAsync('pending_city'),
        SecureStore.deleteItemAsync('pending_services'),
        SecureStore.deleteItemAsync('pending_photo'),
      ]);

      // 6. Charger le profil prestataire et naviguer
      registerPushToken().catch(() => {});
      try {
        const profile = await providerApi.getMe();
        setProfile(profile);
        // Si ville configurée → dashboard ; sinon → onboarding pour compléter
        if (profile.city) {
          router.replace('/(app)/(dashboard)' as any);
        } else {
          router.replace('/(onboarding)/identity');
        }
      } catch {
        router.replace('/(onboarding)/identity');
      }
    } catch (e: any) {
      Alert.alert(
        'Code invalide',
        e?.response?.data?.message ?? 'Vérifiez le code et réessayez',
      );
      setDigits(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.sendOtp(phone);
      setTimer(60);
      Alert.alert('Code renvoyé', `Un nouveau code a été envoyé au ${phone}`);
    } catch {
      Alert.alert('Erreur', 'Impossible de renvoyer le code');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Code de vérification" back />

      <View className="flex-1 px-6" style={{ gap: 24, marginTop: 24 }}>
        <View style={{ gap: 6 }}>
          <Text className="text-white text-xl font-bold">Entrez votre code</Text>
          <Text className="text-slate-400 leading-6">
            Code envoyé au{' '}
            <Text className="text-white font-semibold">{phone}</Text>
          </Text>
        </View>

        {/* Hint OTP fixe */}
        <View style={{ backgroundColor: '#1e3a5f', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ color: '#93c5fd', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>
            Code de vérification : 123456
          </Text>
        </View>

        {/* OTP boxes */}
        <View className="flex-row justify-center" style={{ gap: 10 }}>
          {digits.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(el) => { refs.current[idx] = el; }}
              style={{
                width: 48,
                height: 56,
                borderWidth: 2,
                borderColor: digit ? '#3b82f6' : '#334155',
                borderRadius: 14,
                backgroundColor: '#1e293b',
                color: 'white',
                textAlign: 'center',
                fontSize: 22,
                fontWeight: '700',
              }}
              value={digit}
              onChangeText={(v) => handleChange(v, idx)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={idx === 0}
            />
          ))}
        </View>

        <Button
          title="Vérifier"
          onPress={handleVerify}
          loading={loading}
          disabled={code.length < 6 || loading}
          size="lg"
        />

        {/* Resend */}
        <View className="items-center">
          {timer > 0 ? (
            <Text className="text-slate-400 text-sm">
              Renvoyer dans{' '}
              <Text className="text-white font-semibold">{timer}s</Text>
            </Text>
          ) : (
            <Button title="Renvoyer le code" variant="ghost" onPress={handleResend} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
