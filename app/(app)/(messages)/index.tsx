import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default function MessagesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScreenHeader title="Messages" />
      <EmptyState
        icon="💬"
        title="Aucun message"
        subtitle="Vos échanges avec les clients apparaîtront ici après acceptation d'une offre."
      />
    </SafeAreaView>
  );
}
