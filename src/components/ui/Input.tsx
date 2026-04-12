import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, className, ...props }: InputProps) {
  return (
    <View className="gap-1.5">
      {label && (
        <Text className="text-slate-300 text-sm font-medium">{label}</Text>
      )}
      <View className={`flex-row items-center bg-slate-800 border rounded-xl px-4 ${error ? 'border-danger' : 'border-slate-700'}`}>
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className={`flex-1 text-white py-3.5 text-base ${className ?? ''}`}
          placeholderTextColor="#64748b"
          {...props}
        />
      </View>
      {error && <Text className="text-danger text-xs">{error}</Text>}
    </View>
  );
}
