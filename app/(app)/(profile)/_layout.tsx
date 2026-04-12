import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="edit" />
      <Stack.Screen name="services" />
      <Stack.Screen name="availability" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="offers" />
      <Stack.Screen name="stats" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
