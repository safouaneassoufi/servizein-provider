import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 px-6 justify-between py-10">
        {/* Hero */}
        <View className="flex-1 items-center justify-center" style={{ gap: 24 }}>
          {/* Logo */}
          <View
            className="w-24 h-24 rounded-3xl bg-accent items-center justify-center"
            style={{ shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 20 }}
          >
            <Text style={{ fontSize: 44 }}>🔧</Text>
          </View>

          {/* Texte */}
          <View className="items-center" style={{ gap: 8 }}>
            <Text className="text-white text-4xl font-bold tracking-tight">
              ServiZein Pro
            </Text>
            <Text className="text-slate-400 text-center text-base leading-6">
              La plateforme des prestataires de services à domicile au Maroc.
            </Text>
          </View>

          {/* Stats */}
          <View
            className="flex-row bg-slate-800 rounded-2xl px-6 py-4"
            style={{ gap: 20 }}
          >
            {[
              { value: '500+', label: 'Prestataires' },
              { value: '2500+', label: 'Missions' },
              { value: '4.8★', label: 'Satisfaction' },
            ].map((s, i, arr) => (
              <View key={s.label} className="flex-row items-center" style={{ gap: 20 }}>
                <View className="items-center">
                  <Text className="text-accent text-xl font-bold">{s.value}</Text>
                  <Text className="text-slate-400 text-xs">{s.label}</Text>
                </View>
                {i < arr.length - 1 && (
                  <View className="w-px h-8 bg-slate-700" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={{ gap: 12 }}>
          <Button
            title="Créer un compte prestataire"
            onPress={() => router.push('/(auth)/register')}
            size="lg"
          />
          <Button
            title="J'ai déjà un compte"
            variant="outline"
            size="lg"
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
