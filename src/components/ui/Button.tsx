import { ActivityIndicator, Pressable, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const base = 'rounded-xl items-center justify-center flex-row gap-2';

  const sizes = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3.5',
    lg: 'px-8 py-4',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variants = {
    primary: 'bg-accent',
    outline: 'border border-accent bg-transparent',
    ghost: 'bg-transparent',
    danger: 'bg-danger',
  };

  const textVariants = {
    primary: 'text-white font-semibold',
    outline: 'text-accent font-semibold',
    ghost: 'text-slate-400 font-semibold',
    danger: 'text-white font-semibold',
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading && <ActivityIndicator size="small" color="white" />}
      <Text className={`${textSizes[size]} ${textVariants[variant]}`}>
        {title}
      </Text>
    </Pressable>
  );
}
