import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useCreateOffer } from '@/hooks/useOffers';

const SLOTS = [
  { value: 'MORNING', label: 'Matin (8h-12h)' },
  { value: 'AFTERNOON', label: 'Après-midi (12h-18h)' },
  { value: 'EVENING', label: 'Soir (18h-21h)' },
  { value: 'FLEXIBLE', label: 'Flexible' },
];

const schema = z.object({
  price: z.coerce.number().min(50, 'Prix minimum 50 MAD').max(50000),
  message: z.string().min(10, 'Message trop court').max(500).optional().or(z.literal('')),
  proposedDate: z.string().optional(),
  proposedSlot: z.string().optional(),
  estimatedHours: z.coerce.number().min(0.5).max(24).optional(),
});

type Form = z.infer<typeof schema>;

export default function OfferFormScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const createOffer = useCreateOffer();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const selectedSlot = watch('proposedSlot');

  const onSubmit = async (data: Form) => {
    try {
      await createOffer.mutateAsync({
        requestId,
        price: data.price,
        message: data.message || undefined,
        proposedDate: data.proposedDate || undefined,
        proposedSlot: data.proposedSlot || undefined,
        estimatedHours: data.estimatedHours || undefined,
      });
      Alert.alert('Offre envoyée !', 'Votre offre a bien été envoyée au client.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Erreur lors de l\'envoi');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Envoyer une offre" back />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ gap: 20, paddingBottom: 40, paddingTop: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Price */}
        <Controller
          control={control}
          name="price"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Prix proposé (MAD)"
              placeholder="300"
              keyboardType="number-pad"
              value={value?.toString() ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.price?.message}
            />
          )}
        />

        {/* Message */}
        <Controller
          control={control}
          name="message"
          render={({ field: { value, onChange, onBlur } }) => (
            <View className="gap-1.5">
              <Text className="text-slate-300 text-sm font-medium">
                Message au client (optionnel)
              </Text>
              <View className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                <Input
                  placeholder="Décrivez votre approche, vos qualifications..."
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  error={errors.message?.message}
                />
              </View>
            </View>
          )}
        />

        {/* Date */}
        <Controller
          control={control}
          name="proposedDate"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Date proposée (optionnel)"
              placeholder="2026-04-15"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.proposedDate?.message}
            />
          )}
        />

        {/* Slot */}
        <View className="gap-1.5">
          <Text className="text-slate-300 text-sm font-medium">Créneau (optionnel)</Text>
          <View className="flex-row flex-wrap gap-2">
            {SLOTS.map((slot) => (
              <Button
                key={slot.value}
                title={slot.label}
                variant={selectedSlot === slot.value ? 'primary' : 'outline'}
                size="sm"
                onPress={() =>
                  setValue('proposedSlot', selectedSlot === slot.value ? '' : slot.value)
                }
              />
            ))}
          </View>
        </View>

        {/* Hours */}
        <Controller
          control={control}
          name="estimatedHours"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Durée estimée (heures, optionnel)"
              placeholder="2.5"
              keyboardType="decimal-pad"
              value={value?.toString() ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.estimatedHours?.message}
            />
          )}
        />

        {/* Info */}
        <View className="bg-slate-800 rounded-2xl p-4 gap-1">
          <Text className="text-slate-400 text-sm">
            ℹ️ La commission plateforme (5%, max 50 MAD) sera déduite du montant final.
          </Text>
        </View>

        <Button
          title="Envoyer l'offre"
          onPress={handleSubmit(onSubmit)}
          loading={createOffer.isPending}
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
