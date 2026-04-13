import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Info } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useCreateOffer } from '@/hooks/useOffers';
import { formatPrice } from '@/utils/format';

const SLOTS = [
  { value: 'MORNING', label: 'Matin', sub: '8h–12h' },
  { value: 'AFTERNOON', label: 'Après-midi', sub: '12h–18h' },
  { value: 'EVENING', label: 'Soir', sub: '18h–21h' },
  { value: 'FLEXIBLE', label: 'Flexible', sub: 'À convenir' },
];

const schema = z.object({
  price: z.coerce
    .number({ invalid_type_error: 'Prix requis' })
    .min(50, 'Minimum 50 MAD')
    .max(50_000, 'Maximum 50 000 MAD'),
  message: z
    .string()
    .max(500, '500 caractères max')
    .optional()
    .or(z.literal('')),
  proposedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format AAAA-MM-JJ')
    .optional()
    .or(z.literal('')),
  proposedSlot: z.string().optional(),
  estimatedHours: z.coerce
    .number()
    .min(0.5, 'Min 0.5h')
    .max(24, 'Max 24h')
    .optional()
    .or(z.literal('')),
});

type Form = z.infer<typeof schema>;

function SlotPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text className="text-slate-300 text-sm font-medium">
        Créneau proposé{' '}
        <Text className="text-slate-500">(optionnel)</Text>
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {SLOTS.map((slot) => {
          const selected = value === slot.value;
          return (
            <Pressable
              key={slot.value}
              onPress={() => onChange(selected ? '' : slot.value)}
              className={`px-4 py-2.5 rounded-xl border flex-row items-center gap-1.5 ${
                selected
                  ? 'bg-accent border-accent'
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selected ? 'text-white' : 'text-slate-300'
                }`}
              >
                {slot.label}
              </Text>
              <Text
                className={`text-xs ${selected ? 'text-blue-200' : 'text-slate-500'}`}
              >
                {slot.sub}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function OfferFormScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const createOffer = useCreateOffer();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { proposedSlot: '' },
  });

  const price = watch('price');
  const platformFee = price
    ? Math.min(Math.max(Number(price) * 0.05, 10), 50)
    : 0;
  const providerAmount = price ? Number(price) - platformFee : 0;

  const onSubmit = async (data: Form) => {
    try {
      await createOffer.mutateAsync({
        requestId,
        price: data.price,
        message: data.message || undefined,
        proposedDate: data.proposedDate || undefined,
        proposedSlot: data.proposedSlot || undefined,
        estimatedHours: data.estimatedHours
          ? Number(data.estimatedHours)
          : undefined,
      });
      Alert.alert(
        '✅ Offre envoyée !',
        'Votre offre a été transmise au client. Vous serez notifié de sa réponse.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e: any) {
      Alert.alert(
        'Erreur',
        e?.response?.data?.message ?? 'Erreur lors de l\'envoi de l\'offre',
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top', 'bottom']}>
      <ScreenHeader title="Envoyer une offre" back />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ gap: 16, paddingTop: 12, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Prix ───────────────────────── */}
          <Controller
            control={control}
            name="price"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Prix proposé (MAD) *"
                placeholder="ex: 350"
                keyboardType="number-pad"
                value={value?.toString() ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.price?.message}
              />
            )}
          />

          {/* ─── Commission preview ──────────── */}
          {price > 0 && (
            <View className="bg-slate-800 rounded-xl p-3" style={{ gap: 6 }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-400 text-sm">Montant total client</Text>
                <Text className="text-white font-semibold">
                  {formatPrice(Number(price))}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-400 text-sm">
                  Commission plateforme (5%)
                </Text>
                <Text className="text-danger text-sm">
                  -{formatPrice(platformFee)}
                </Text>
              </View>
              <View className="h-px bg-slate-700" />
              <View className="flex-row items-center justify-between">
                <Text className="text-white font-semibold">Vous recevez</Text>
                <Text className="text-success font-bold text-base">
                  {formatPrice(providerAmount)}
                </Text>
              </View>
            </View>
          )}

          {/* ─── Message ────────────────────── */}
          <Controller
            control={control}
            name="message"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Message au client (optionnel)"
                placeholder="Présentez votre approche, vos qualifications…"
                multiline
                numberOfLines={4}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.message?.message}
              />
            )}
          />

          {/* ─── Date proposée ──────────────── */}
          <Controller
            control={control}
            name="proposedDate"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Date proposée (optionnel)"
                placeholder="2026-04-20"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.proposedDate?.message}
              />
            )}
          />

          {/* ─── Créneau ────────────────────── */}
          <Controller
            control={control}
            name="proposedSlot"
            render={({ field: { value, onChange } }) => (
              <SlotPicker value={value} onChange={onChange} />
            )}
          />

          {/* ─── Durée ──────────────────────── */}
          <Controller
            control={control}
            name="estimatedHours"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Durée estimée en heures (optionnel)"
                placeholder="ex: 2.5"
                keyboardType="decimal-pad"
                value={value?.toString() ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.estimatedHours?.message}
              />
            )}
          />

          {/* ─── Info ───────────────────────── */}
          <View className="flex-row items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <Info size={15} color="#3b82f6" style={{ marginTop: 1 }} />
            <Text className="flex-1 text-slate-400 text-xs leading-4">
              Une fois l'offre envoyée, le client peut l'accepter, la refuser
              ou faire une contre-offre. Vous serez notifié dans tous les cas.
            </Text>
          </View>

          {/* ─── Submit ─────────────────────── */}
          <Button
            title="Envoyer l'offre"
            onPress={handleSubmit(onSubmit)}
            loading={createOffer.isPending}
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
