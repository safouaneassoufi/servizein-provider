import { useEffect, useRef, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useVerifyOtp } from '@/hooks/useAuth';
import { authApi } from '@/api/auth.api';

export default function OtpScreen() {
  const { phone, purpose } = useLocalSearchParams<{
    phone: string;
    purpose: 'REGISTER' | 'RESET_PASSWORD';
  }>();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const refs = useRef<(TextInput | null)[]>([]);
  const verifyOtp = useVerifyOtp();

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
    try {
      if (purpose === 'RESET_PASSWORD') {
        router.push({
          pathname: '/(auth)/reset-password',
          params: { phone, code },
        } as any);
        return;
      }
      await verifyOtp.mutateAsync({ phone, code });
    } catch (e: any) {
      Alert.alert(
        'Code invalide',
        e?.response?.data?.message ?? 'Vérifiez le code et réessayez',
      );
      setDigits(['', '', '', '', '', '']);
      refs.current[0]?.focus();
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
          <Text className="text-white text-xl font-bold">
            Entrez votre code
          </Text>
          <Text className="text-slate-400 leading-6">
            Code envoyé au{' '}
            <Text className="text-white font-semibold">{phone}</Text>
          </Text>
        </View>

        {/* OTP boxes */}
        <View className="flex-row justify-center" style={{ gap: 10 }}>
          {digits.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(el) => {
                refs.current[idx] = el;
              }}
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
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, idx)
              }
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
          loading={verifyOtp.isPending}
          disabled={code.length < 6}
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
            <Button
              title="Renvoyer le code"
              variant="ghost"
              onPress={handleResend}
            />
          )}
        </View>

        {/* Dev hint */}
        <View className="bg-slate-800/60 rounded-xl p-3">
          <Text className="text-slate-500 text-xs text-center">
            🛠 Dev: utilisez le code{' '}
            <Text className="text-slate-300 font-mono">123456</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
