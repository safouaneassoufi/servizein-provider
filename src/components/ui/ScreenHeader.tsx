import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, back = false, right }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center px-4 pt-4 pb-2 gap-3">
      {back && (
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center"
        >
          <ChevronLeft size={20} color="#94a3b8" />
        </Pressable>
      )}
      <View className="flex-1">
        <Text className="text-white text-xl font-bold">{title}</Text>
        {subtitle && <Text className="text-slate-400 text-sm">{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}
