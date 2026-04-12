import { Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 px-6 justify-between py-8">
        {/* Hero */}
        <View className="flex-1 items-center justify-center gap-6">
          <View className="w-24 h-24 rounded-3xl bg-accent items-center justify-center">
            <Text className="text-4xl">🔧</Text>
          </View>
          <View className="items-center gap-3">
            <Text className="text-white text-4xl font-bold tracking-tight">
              ServiZein Pro
            </Text>
            <Text className="text-slate-400 text-center text-base leading-6">
              Gérez vos demandes, envoyez des offres et développez votre activité de prestataire.
            </Text>
          </View>

          {/* Stats */}
          <View className="flex-row gap-6 mt-4">
            <View className="items-center">
              <Text className="text-accent text-2xl font-bold">500+</Text>
              <Text className="text-slate-400 text-xs">Prestataires</Text>
            </View>
            <View className="w-px bg-slate-700" />
            <View className="items-center">
              <Text className="text-accent text-2xl font-bold">2500+</Text>
              <Text className="text-slate-400 text-xs">Missions</Text>
            </View>
            <View className="w-px bg-slate-700" />
            <View className="items-center">
              <Text className="text-accent text-2xl font-bold">4.8★</Text>
              <Text className="text-slate-400 text-xs">Note moyenne</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="gap-3">
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
