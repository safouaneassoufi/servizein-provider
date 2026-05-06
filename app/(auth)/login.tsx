import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { authApi } from '@/api/auth.api';
import { providerApi } from '@/api/provider.api';
import { useAuthStore } from '@/store/auth.store';
import { useProviderStore } from '@/store/provider.store';
import { registerPushToken } from '@/hooks/usePushNotifications';

type CountryCode = { code: string; flag: string; name: string };

const COUNTRY_CODES: CountryCode[] = [
  { code: '+212', flag: '🇲🇦', name: 'Maroc' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgique' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada / USA' },
];

export default function LoginScreen() {
  const [countryCode, setCountryCode]     = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phone, setPhone]                 = useState('');
  const [password, setPassword]           = useState('');
  const [loading, setLoading]             = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const { setTokens } = useAuthStore();
  const { setProfile } = useProviderStore();

  const handleLogin = async () => {
    if (!phone.trim()) return Alert.alert('Erreur', 'Numéro de téléphone requis');
    if (!password)     return Alert.alert('Erreur', 'Mot de passe requis');

    const identifier = `${countryCode.code}${phone.trim()}`;
    setLoading(true);
    try {
      // authApi.login retourne { accessToken, refreshToken } (envelope déjà désencapsulée)
      const tokens = await authApi.login({ identifier, password });
      await setTokens(tokens);

      registerPushToken().catch(() => {});

      try {
        const profile = await providerApi.getMe();
        setProfile(profile);
        if (profile.city || profile.bio) {
          router.replace('/(app)/(dashboard)' as any);
        } else {
          router.replace('/(onboarding)/identity');
        }
      } catch {
        router.replace('/(onboarding)/identity');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Identifiants incorrects';
      Alert.alert('Erreur', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
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
        {/* ── Téléphone + indicatif ── */}
        <View className="gap-1.5">
          <Text className="text-slate-300 text-sm font-medium">Téléphone</Text>
          <View className="flex-row gap-2 items-center">
            <TouchableOpacity
              onPress={() => setShowCountryPicker(true)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 flex-row items-center gap-1"
              style={{ height: 48 }}
            >
              <Text style={{ fontSize: 18 }}>{countryCode.flag}</Text>
              <Text className="text-white text-sm font-semibold">{countryCode.code}</Text>
              <Text className="text-slate-400 text-xs ml-0.5">▼</Text>
            </TouchableOpacity>
            <View className="flex-1">
              <TextInput
                style={{
                  height: 48,
                  backgroundColor: '#1e293b',
                  borderWidth: 1,
                  borderColor: '#334155',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  color: 'white',
                  fontSize: 16,
                }}
                placeholder="612345678"
                placeholderTextColor="#475569"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>
        </View>

        {/* ── Mot de passe ── */}
        <Input
          label="Mot de passe"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          onPress={() => router.push('/(auth)/forgot-password')}
          className="items-end"
        >
          <Text className="text-accent text-sm">Mot de passe oublié ?</Text>
        </Pressable>

        <Button
          title="Se connecter"
          onPress={handleLogin}
          loading={loading}
          size="lg"
        />

        <Button
          title="Créer un compte"
          variant="ghost"
          onPress={() => router.replace('/(auth)/register')}
        />
      </ScrollView>

      {/* ── Country picker modal ── */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={() => setShowCountryPicker(false)}
        >
          <View
            style={{
              margin: 24,
              marginTop: 'auto',
              marginBottom: 48,
              backgroundColor: '#1e293b',
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontWeight: '700',
                fontSize: 16,
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#334155',
              }}
            >
              Indicatif pays
            </Text>
            {COUNTRY_CODES.map((c) => (
              <TouchableOpacity
                key={c.code}
                onPress={() => { setCountryCode(c); setShowCountryPicker(false); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(51,65,85,0.5)',
                  backgroundColor:
                    countryCode.code === c.code
                      ? 'rgba(59,130,246,0.1)'
                      : 'transparent',
                }}
              >
                <Text style={{ fontSize: 24, marginRight: 12 }}>{c.flag}</Text>
                <Text style={{ color: 'white', fontSize: 16, flex: 1 }}>{c.name}</Text>
                <Text style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{c.code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
