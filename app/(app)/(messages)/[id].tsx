import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDateTime, userName } from '@/utils/format';
import type { Booking } from '@/types';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderType: 'PROVIDER' | 'CLIENT';
}

function useMissionChat(missionId: string) {
  return useQuery({
    queryKey: ['chat', missionId],
    queryFn: async () => {
      // Try messages endpoint; gracefully return empty if not available
      try {
        const { data } = await apiClient.get<Message[]>(
          `/bookings/${missionId}/messages`,
        );
        return data;
      } catch {
        return [] as Message[];
      }
    },
    refetchInterval: 10_000,
    enabled: !!missionId,
  });
}

function useSendMessage(missionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await apiClient.post(`/bookings/${missionId}/messages`, {
        content,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chat', missionId] }),
  });
}

function useMissionInfo(missionId: string) {
  return useQuery({
    queryKey: ['missions', 'detail', missionId],
    queryFn: async () => {
      const { data } = await apiClient.get<Booking>(`/bookings/${missionId}`);
      return data;
    },
    enabled: !!missionId,
  });
}

function MessageBubble({ msg }: { msg: Message }) {
  const isMe = msg.senderType === 'PROVIDER';
  return (
    <View
      className={`max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
      style={{ marginBottom: 8 }}
    >
      <View
        className={`rounded-2xl px-4 py-3 ${
          isMe ? 'bg-accent rounded-tr-sm' : 'bg-slate-700 rounded-tl-sm'
        }`}
      >
        <Text className="text-white text-sm leading-5">{msg.content}</Text>
      </View>
      <Text className="text-slate-500 text-[10px] mt-1">
        {formatDateTime(msg.createdAt)}
      </Text>
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const { data: messages, isLoading } = useMissionChat(id);
  const { data: mission } = useMissionInfo(id);
  const sendMessage = useSendMessage(id);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    sendMessage.mutate(trimmed);
  };

  if (isLoading) return <LoadingSpinner full />;

  const clientName = mission ? userName(mission.client) : 'Client';

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top', 'bottom']}>
      <ScreenHeader title={clientName} subtitle={mission?.category?.name} back />

      {/* Mission status bar */}
      {mission && (
        <View className="mx-4 mb-2 bg-slate-800 rounded-xl px-3 py-2">
          <Text className="text-slate-400 text-xs text-center">
            Mission · {mission.category?.name} · {mission.status}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <Text className="text-slate-500 text-sm">
                Aucun message. Écrivez le premier !
              </Text>
            </View>
          }
          renderItem={({ item }) => <MessageBubble msg={item} />}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View className="flex-row items-end gap-2 px-4 py-3 bg-slate-900 border-t border-slate-800">
          <TextInput
            className="flex-1 bg-slate-800 text-white rounded-2xl px-4 py-3 text-sm"
            placeholder="Écrire un message…"
            placeholderTextColor="#64748b"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || sendMessage.isPending}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              text.trim() ? 'bg-accent' : 'bg-slate-700'
            }`}
          >
            <Send size={18} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
