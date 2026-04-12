import { Text, View } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: 'bg-success/20', text: 'text-success' },
  warning: { bg: 'bg-warning/20', text: 'text-warning' },
  danger: { bg: 'bg-danger/20', text: 'text-danger' },
  info: { bg: 'bg-accent/20', text: 'text-accent' },
  muted: { bg: 'bg-slate-700', text: 'text-slate-400' },
};

export function Badge({ label, variant = 'info' }: BadgeProps) {
  const { bg, text } = variants[variant];
  return (
    <View className={`${bg} px-2.5 py-1 rounded-full`}>
      <Text className={`${text} text-xs font-semibold`}>{label}</Text>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function offerStatusBadge(status: string): BadgeProps {
  const map: Record<string, BadgeProps> = {
    PENDING: { label: 'En attente', variant: 'info' },
    SEEN: { label: 'Vue', variant: 'muted' },
    COUNTER_OFFERED: { label: 'Contre-offre', variant: 'warning' },
    ACCEPTED: { label: 'Acceptée', variant: 'success' },
    REJECTED: { label: 'Refusée', variant: 'danger' },
    EXPIRED: { label: 'Expirée', variant: 'muted' },
    WITHDRAWN: { label: 'Retirée', variant: 'muted' },
  };
  return map[status] ?? { label: status, variant: 'muted' };
}

export function missionStatusBadge(status: string): BadgeProps {
  const map: Record<string, BadgeProps> = {
    CONFIRMED: { label: 'Confirmée', variant: 'info' },
    PROVIDER_EN_ROUTE: { label: 'En route', variant: 'warning' },
    PROVIDER_ARRIVED: { label: 'Arrivé', variant: 'warning' },
    IN_PROGRESS: { label: 'En cours', variant: 'warning' },
    COMPLETED: { label: 'Terminée', variant: 'success' },
    CANCELLED: { label: 'Annulée', variant: 'danger' },
    DISPUTED: { label: 'Litige', variant: 'danger' },
  };
  return map[status] ?? { label: status, variant: 'muted' };
}

export function requestStatusBadge(status: string): BadgeProps {
  const map: Record<string, BadgeProps> = {
    OPEN: { label: 'Ouverte', variant: 'success' },
    QUOTED: { label: 'Offre envoyée', variant: 'info' },
    ACCEPTED: { label: 'Acceptée', variant: 'success' },
    CANCELLED: { label: 'Annulée', variant: 'danger' },
    EXPIRED: { label: 'Expirée', variant: 'muted' },
  };
  return map[status] ?? { label: status, variant: 'muted' };
}
