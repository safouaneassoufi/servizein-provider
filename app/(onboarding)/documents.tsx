import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '@/components/ui/Button';
import { mediaApi } from '@/api/media.api';
import { CheckCircle, Upload } from 'lucide-react-native';

interface DocState {
  uri?: string;
  name?: string;
  uploaded?: boolean;
  url?: string;
}

export default function DocumentsScreen() {
  const [cin, setCin] = useState<DocState>({});
  const [rib, setRib] = useState<DocState>({});
  const [uploading, setUploading] = useState(false);

  const pickDoc = async (setter: (d: DocState) => void) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setter({ uri: asset.uri, name: asset.name });
      }
    } catch {}
  };

  const uploadDoc = async (doc: DocState, setter: (d: DocState) => void) => {
    if (!doc.uri || !doc.name) return;
    setUploading(true);
    try {
      const result = await mediaApi.uploadDocument(doc.uri, doc.name);
      setter({ ...doc, uploaded: true, url: result.url });
    } catch {
      Alert.alert('Erreur', 'Erreur lors de l\'upload. Réessayez.');
    } finally {
      setUploading(false);
    }
  };

  const handleFinish = () => {
    router.replace('/(app)/(dashboard)');
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Progress */}
      <View className="px-6 pt-4 gap-3">
        <View className="flex-row gap-1">
          {[1, 2, 3, 4, 5].map((step) => (
            <View key={step} className="h-1 flex-1 rounded-full bg-accent" />
          ))}
        </View>
        <Text className="text-slate-400 text-sm">Étape 5 sur 5 — Documents KYC</Text>
      </View>

      <ScrollView className="flex-1 px-6 mt-6" contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
        <View>
          <Text className="text-white text-2xl font-bold">Vérification d'identité</Text>
          <Text className="text-slate-400 mt-1 leading-6">
            Ces documents sont requis pour activer votre compte prestataire. La vérification prend 24-48h.
          </Text>
        </View>

        {/* CIN */}
        <DocCard
          label="Carte Nationale d'Identité (CIN)"
          description="Recto et verso en un seul fichier PDF ou photo"
          doc={cin}
          onPick={() => pickDoc(setCin)}
          onUpload={() => uploadDoc(cin, setCin)}
          uploading={uploading}
        />

        {/* RIB */}
        <DocCard
          label="RIB Bancaire"
          description="Relevé d'identité bancaire pour recevoir vos paiements"
          doc={rib}
          onPick={() => pickDoc(setRib)}
          onUpload={() => uploadDoc(rib, setRib)}
          uploading={uploading}
        />

        <View className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 gap-2">
          <Text className="text-blue-400 font-semibold">ℹ️ Compte en attente de vérification</Text>
          <Text className="text-slate-400 text-sm leading-5">
            Vous pouvez accéder à l'application mais vous ne pourrez pas envoyer d'offres tant que votre KYC n'est pas approuvé.
          </Text>
        </View>

        <Button
          title="Terminer l'inscription"
          onPress={handleFinish}
          size="lg"
        />

        <Button
          title="Passer pour l'instant"
          variant="ghost"
          onPress={handleFinish}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function DocCard({
  label,
  description,
  doc,
  onPick,
  onUpload,
  uploading,
}: {
  label: string;
  description: string;
  doc: DocState;
  onPick: () => void;
  onUpload: () => void;
  uploading: boolean;
}) {
  return (
    <View className="bg-slate-800 rounded-2xl p-4 gap-3">
      <View>
        <Text className="text-white font-semibold">{label}</Text>
        <Text className="text-slate-400 text-sm mt-0.5">{description}</Text>
      </View>

      {doc.uploaded ? (
        <View className="flex-row items-center gap-2">
          <CheckCircle size={20} color="#22c55e" />
          <Text className="text-success text-sm">{doc.name} — Uploadé</Text>
        </View>
      ) : doc.uri ? (
        <View className="gap-2">
          <Text className="text-slate-300 text-sm">{doc.name}</Text>
          <Button
            title="Envoyer le document"
            onPress={onUpload}
            loading={uploading}
            size="sm"
          />
        </View>
      ) : (
        <Pressable
          onPress={onPick}
          className="border-2 border-dashed border-slate-600 rounded-xl p-6 items-center gap-2"
        >
          <Upload size={24} color="#64748b" />
          <Text className="text-slate-400 text-sm">Appuyer pour sélectionner</Text>
        </Pressable>
      )}
    </View>
  );
}
