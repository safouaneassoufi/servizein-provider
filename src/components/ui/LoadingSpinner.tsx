import { ActivityIndicator, View } from 'react-native';

interface LoadingSpinnerProps {
  full?: boolean;
}

export function LoadingSpinner({ full = false }: LoadingSpinnerProps) {
  if (full) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
  return (
    <View className="py-8 items-center">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}
