import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, style, ...props }: InputProps) {
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text className="text-slate-300 text-sm font-medium">{label}</Text>
      ) : null}
      <View
        className={`flex-row items-start bg-slate-800 border rounded-xl px-4 ${
          error ? 'border-danger' : 'border-slate-700'
        }`}
      >
        {leftIcon ? (
          <View className="mr-2 pt-3.5">{leftIcon}</View>
        ) : null}
        <TextInput
          className="flex-1 text-white text-sm"
          placeholderTextColor="#64748b"
          style={[{ paddingVertical: 14, minHeight: props.multiline ? 80 : undefined }, style]}
          {...props}
        />
      </View>
      {error ? (
        <Text className="text-danger text-xs">{error}</Text>
      ) : null}
    </View>
  );
}
