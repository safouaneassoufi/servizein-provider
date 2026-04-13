import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { View } from 'react-native';

export default function AppLayout() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) return <View style={{ flex: 1, backgroundColor: '#0f172a' }} />;
  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(dashboard)" />
      <Stack.Screen
        name="(requests)/[id]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(requests)/offer/[requestId]"
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="(missions)/[id]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(messages)/[id]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(notifications)/index"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(profile)/edit"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(profile)/services"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(profile)/availability"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(profile)/documents"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(profile)/offers"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(profile)/stats"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="(profile)/settings"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
