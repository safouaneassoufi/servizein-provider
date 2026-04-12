import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatPrice(amount: number): string {
  return `${amount.toFixed(0)} MAD`;
}

export function formatDate(dateStr: string, pattern = 'dd MMM yyyy'): string {
  try {
    return format(parseISO(dateStr), pattern, { locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, 'dd/MM/yyyy');
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, "dd MMM yyyy 'à' HH:mm");
}

export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours === 1) return '1 heure';
  return `${hours} heures`;
}

export function formatPhone(phone: string): string {
  // +212612345678 → +212 6 12 34 56 78
  const clean = phone.replace(/\s/g, '');
  if (clean.startsWith('+212')) {
    const local = clean.slice(4);
    return `+212 ${local.slice(0, 1)} ${local.slice(1, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
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
