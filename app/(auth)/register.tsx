import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { apiClient } from '@/api/client';

// ─── Country codes ────────────────────────────────────────────────────────────

type CountryCode = { code: string; flag: string; name: string };

const COUNTRY_CODES: CountryCode[] = [
  { code: '+212', flag: '🇲🇦', name: 'Maroc' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgique' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada / USA' },
];

// ─── Fallback services (used if /catalog/categories is unauthenticated) ───────

type ServiceChip = { id: string; name: string; emoji: string };

const FALLBACK_SERVICES: ServiceChip[] = [
  { id: 'plomberie',    name: 'Plomberie',    emoji: '🔧' },
  { id: 'electricite',  name: 'Électricité',  emoji: '⚡' },
  { id: 'peinture',     name: 'Peinture',     emoji: '🎨' },
  { id: 'menage',       name: 'Ménage',       emoji: '🧹' },
  { id: 'jardinage',    name: 'Jardinage',    emoji: '🌿' },
  { id: 'serrurerie',   name: 'Serrurerie',   emoji: '🔑' },
  { id: 'climatisation',name: 'Climatisation',emoji: '❄️' },
  { id: 'demenagement', name: 'Déménagement', emoji: '📦' },
  { id: 'informatique', name: 'Informatique', emoji: '💻' },
];

const EMOJI_MAP: Record<string, string> = {
  'Plomberie': '🔧', 'Électricité': '⚡', 'Peinture': '🎨',
  'Ménage': '🧹', 'Jardinage': '🌿', 'Serrurerie': '🔑',
  'Climatisation': '❄️', 'Déménagement': '📦', 'Informatique': '💻',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const [photo, setPhoto]                     = useState<string | null>(null);
  const [prenom, setPrenom]                   = useState('');
  const [nom, setNom]                         = useState('');
  const [email, setEmail]                     = useState('');
  const [countryCode, setCountryCode]         = useState(COUNTRY_CODES[0]);
  const [phone, setPhone]                     = useState('');
  const [ville, setVille]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [services, setServices]               = useState<ServiceChip[]>(FALLBACK_SERVICES);
  const [selectedServices, setSelectedServices] = useState<ServiceChip[]>([]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading]                 = useState(false);

  // Try to fetch real categories (needs auth — will likely fail here, fallback used)
  useEffect(() => {
    (apiClient.get('/catalog/categories') as any)
      .then((cats: any) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setServices(
            cats.map((c: any) => ({
              id:    c.id,
              name:  c.name,
              emoji: c.icon ?? EMOJI_MAP[c.name] ?? '🔧',
            })),
          );
        }
      })
      .catch(() => {}); // keep fallback silently
  }, []);

  // ─── Photo picker ───────────────────────────────────────────────────────────

  const pickPhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  // ─── Service chip toggle ────────────────────────────────────────────────────

  const toggleService = (svc: ServiceChip) => {
    setSelectedServices((prev) =>
      prev.find((s) => s.id === svc.id)
        ? prev.filter((s) => s.id !== svc.id)
        : [...prev, svc],
    );
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleRegister = async () => {
    if (!prenom.trim() || !nom.trim())
      return Alert.alert('Erreur', 'Prénom et nom requis');
    if (!email.trim() || !email.includes('@'))
      return Alert.alert('Erreur', 'Email invalide');
    if (!phone.trim() || phone.trim().length < 7)
      return Alert.alert('Erreur', 'Numéro de téléphone invalide');
    if (!ville.trim())
      return Alert.alert('Erreur', "Ville d'intervention requise");
    if (selectedServices.length === 0)
      return Alert.alert('Erreur', 'Sélectionnez au moins un service');
    if (password.length < 8)
      return Alert.alert('Erreur', 'Mot de passe trop court (minimum 8 caractères)');
    if (password !== confirmPassword)
      return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');

    const fullPhone = `${countryCode.code}${phone.trim()}`;

    setLoading(true);
    try {
      await authApi.register({
        name:     `${prenom.trim()} ${nom.trim()}`,
        phone:    fullPhone,
        email:    email.trim().toLowerCase(),
        password,
      });

      // Renvoyer l'OTP explicitement (le backend l'envoie aussi automatiquement)
      await authApi.sendOtp(fullPhone).catch(() => {});

      // Persist registration data for after OTP verification
      await Promise.all([
        SecureStore.setItemAsync('pending_phone',    fullPhone),
        SecureStore.setItemAsync('pending_city',     ville.trim()),
        SecureStore.setItemAsync('pending_services', JSON.stringify(selectedServices)),
        photo
          ? SecureStore.setItemAsync('pending_photo', photo)
          : SecureStore.deleteItemAsync('pending_photo'),
      ]);

      router.push({
        pathname: '/(auth)/otp',
        params: { phone: fullPhone, purpose: 'REGISTER' },
      } as any);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Erreur d'inscription";
      Alert.alert('Erreur', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const pwMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Créer un compte" back />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ gap: 16, paddingTop: 12, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Photo ── */}
        <TouchableOpacity onPress={pickPhoto} className="items-center">
          <View
            className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-600 items-center justify-center overflow-hidden"
          >
            {photo ? (
              <Image
                source={{ uri: photo }}
                style={{ width: 96, height: 96 }}
              />
            ) : (
              <Text style={{ fontSize: 32 }}>📷</Text>
            )}
          </View>
          <Text className="text-slate-400 text-xs mt-2">
            Photo de profil (optionnelle)
          </Text>
        </TouchableOpacity>

        {/* ── Prénom + Nom ── */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Prénom"
              placeholder="Mohammed"
              autoCapitalize="words"
              value={prenom}
              onChangeText={setPrenom}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Nom"
              placeholder="Alami"
              autoCapitalize="words"
              value={nom}
              onChangeText={setNom}
            />
          </View>
        </View>

        {/* ── Email ── */}
        <Input
          label="Email"
          placeholder="votre@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

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

        {/* ── Ville ── */}
        <Input
          label="Ville d'intervention"
          placeholder="Casablanca"
          autoCapitalize="words"
          value={ville}
          onChangeText={setVille}
        />

        {/* ── Services ── */}
        <View className="gap-2">
          <Text className="text-slate-300 text-sm font-medium">
            Services proposés <Text className="text-danger">*</Text>
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {services.map((svc) => {
              const selected = !!selectedServices.find((s) => s.id === svc.id);
              return (
                <TouchableOpacity
                  key={svc.id}
                  onPress={() => toggleService(svc)}
                  className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
                    selected
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <Text>{svc.emoji}</Text>
                  <Text
                    className={`text-sm font-medium ${
                      selected ? 'text-blue-400' : 'text-slate-300'
                    }`}
                  >
                    {svc.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedServices.length === 0 && (
            <Text className="text-slate-500 text-xs">
              Sélectionnez au moins 1 service
            </Text>
          )}
        </View>

        {/* ── Password ── */}
        <Input
          label="Mot de passe"
          placeholder="Minimum 8 caractères"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Input
          label="Confirmer le mot de passe"
          placeholder="Répétez votre mot de passe"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={pwMismatch ? 'Les mots de passe ne correspondent pas' : undefined}
        />

        <Text className="text-slate-500 text-xs text-center leading-5">
          En vous inscrivant, vous acceptez nos Conditions d'utilisation.
        </Text>

        <Button
          title="Créer mon compte"
          onPress={handleRegister}
          loading={loading}
          size="lg"
        />

        <Button
          title="J'ai déjà un compte"
          variant="ghost"
          onPress={() => router.replace('/(auth)/login')}
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
                onPress={() => {
                  setCountryCode(c);
                  setShowCountryPicker(false);
                }}
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
