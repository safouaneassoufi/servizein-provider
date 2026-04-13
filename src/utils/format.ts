import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatPrice(amount: number): string {
  if (isNaN(amount)) return '— MAD';
  return `${Math.round(amount).toLocaleString('fr-MA')} MAD`;
}

export function formatDate(dateStr: string, pattern = 'dd MMM yyyy'): string {
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, pattern, { locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, "dd MMM yyyy 'à' HH:mm");
}

export function formatRelative(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    return formatDistanceToNow(d, { addSuffix: true, locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatRating(rating: number): string {
  if (isNaN(rating) || rating == null) return '—';
  return rating.toFixed(1);
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours === 1) return '1 heure';
  return `${hours} heures`;
}

export function formatPhone(phone: string): string {
  const clean = (phone ?? '').replace(/\s/g, '');
  if (clean.startsWith('+212') && clean.length === 13) {
    const local = clean.slice(4);
    return `+212 ${local[0]} ${local.slice(1, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
  }
  return phone;
}

export function formatSlot(slot: string): string {
  const map: Record<string, string> = {
    MORNING: 'Matin (8h-12h)',
    AFTERNOON: 'Après-midi (12h-18h)',
    EVENING: 'Soir (18h-21h)',
    FLEXIBLE: 'Horaire flexible',
  };
  return map[slot] ?? slot;
}

/** Extract display name from backend user (uses `name` field) */
export function userName(user?: { name?: string } | null): string {
  return user?.name ?? 'Utilisateur';
}

/** Extract initials from name */
export function userInitials(user?: { name?: string } | null): string {
  const n = user?.name ?? '';
  const parts = n.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts[0]) return parts[0][0].toUpperCase();
  return '?';
}
