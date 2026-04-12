import { Text, View } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '📭', title, subtitle, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-4">
      <Text className="text-5xl">{icon}</Text>
      <Text className="text-white text-lg font-semibold text-center">{title}</Text>
      {subtitle && (
        <Text className="text-slate-400 text-sm text-center">{subtitle}</Text>
      )}
      {action}
    </View>
  );
}
