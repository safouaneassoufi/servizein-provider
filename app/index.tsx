import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '@/store/auth.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Index() {
  const { isHydrated, isAuthenticated } = useAuthStore();

  if (!isHydrated) {
    return (
      <View className="flex-1 bg-primary">
        <LoadingSpinner full />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/(dashboard)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
