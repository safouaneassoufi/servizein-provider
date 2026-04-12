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

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const refs = useRef<TextInput[]>([]);
  const verifyOtp = useVerifyOtp();

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[idx] = val;
    setCode(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !code[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) return;
    try {
      if (purpose === 'RESET_PASSWORD') {
        router.push({
          pathname: '/(auth)/reset-password',
          params: { phone, code: fullCode },
        } as any);
        return;
      }
      await verifyOtp.mutateAsync({ phone, code: fullCode, purpose });
    } catch (e: any) {
      Alert.alert('Code invalide', e?.response?.data?.message ?? 'Vérifiez votre code');
    }
  };

  const handleResend = async () => {
    try {
      await authApi.forgotPassword(phone);
      setResendTimer(60);
    } catch {}
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Code de vérification" back />
      <View className="flex-1 px-6 gap-6 mt-6">
        <Text className="text-slate-400 text-center leading-6">
          Un code à 6 chiffres a été envoyé au{'\n'}
          <Text className="text-white font-semibold">{phone}</Text>
        </Text>

        {/* OTP inputs */}
        <View className="flex-row justify-center gap-3">
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(el) => { if (el) refs.current[idx] = el; }}
              className="w-12 h-14 border border-slate-700 rounded-xl bg-slate-800 text-white text-center text-xl font-bold"
              value={digit}
              onChangeText={(v) => handleChange(v, idx)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Button
          title="Vérifier"
          onPress={handleVerify}
          loading={verifyOtp.isPending}
          disabled={code.join('').length < 6}
          size="lg"
        />

        <View className="items-center">
          {resendTimer > 0 ? (
            <Text className="text-slate-400 text-sm">
              Renvoyer dans {resendTimer}s
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
        <Text className="text-slate-600 text-xs text-center">
          En développement, utilisez le code 123456
        </Text>
      </View>
    </SafeAreaView>
  );
}
