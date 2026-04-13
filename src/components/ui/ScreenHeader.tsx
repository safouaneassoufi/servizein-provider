import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  back = false,
  right,
}: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center px-4 py-3 gap-3">
      {back && (
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center"
        >
          <ChevronLeft size={20} color="#94a3b8" />
        </Pressable>
      )}
      <View className="flex-1">
        <Text className="text-white text-lg font-bold" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? null}
    </View>
  );
}
