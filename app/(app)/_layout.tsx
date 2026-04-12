import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function AppLayout() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(dashboard)" />
      <Stack.Screen name="(requests)" />
      <Stack.Screen name="(missions)" />
      <Stack.Screen name="(messages)" />
      <Stack.Screen name="(earnings)" />
      <Stack.Screen name="(notifications)" />
      <Stack.Screen name="(profile)" />
    </Stack>
  );
}
