import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useRouter } from 'expo-router';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { MessageSquareText } from 'lucide-react-native';

export interface InboxUserButtonProps {
  targetUserId: string;
  style?: any;
  textStyle?: any;
  children?: React.ReactNode;
}

export const InboxUserButton: React.FC<InboxUserButtonProps> = ({ targetUserId, style, textStyle, children }) => {
  const currentUser = useAuthStore(state => state.user);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [existingThreadId, setExistingThreadId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!currentUser?.id || currentUser.id === targetUserId) {
      setIsChecking(false);
      return;
    }

    const checkInbox = async () => {
      try {
        const { data } = await supabase
          .from('inbox')
          .select('id')
          .eq('user_id', currentUser.id)
          .eq('participant_id', targetUserId)
          .eq('chat_type', 'private')
          .maybeSingle();

        if (data?.id) {
          setExistingThreadId(data.id);
        }
      } catch (err) {
        console.error('Error verifying inbox on mount:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkInbox();
  }, [currentUser?.id, targetUserId]);

  const handlePress = async () => {
    if (!currentUser?.id || currentUser.id === targetUserId || isLoading || isChecking) return;

    if (existingThreadId) {
      // Inbox already exists! Just navigate to it.
      router.push(`/inboxDetail?threadId=${existingThreadId}`);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Check if a private inbox ALREADY exists between current user and target user
      const { data: existingInbox, error: checkError } = await supabase
        .from('inbox')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('participant_id', targetUserId)
        .eq('chat_type', 'private')
        .maybeSingle();

      if (checkError) {
        console.error('Error checking inbox:', checkError);
      }

      if (existingInbox?.id) {
        // Inbox already exists! Just navigate to it.
        router.push(`/inboxDetail?threadId=${existingInbox.id}`);
        return;
      }

      // 2. No inbox exists. Call the RPC to bypass RLS and create rows for both users safely
      const { data: newThreadId, error: rpcError } = await supabase
        .rpc('create_private_inbox', {
          target_user_id: targetUserId
        });

      if (rpcError || !newThreadId) {
        console.error('Error creating private inbox via RPC:', rpcError);
        return;
      }

      // 3. Navigate to the newly created inbox thread
      router.push(`/inboxDetail?threadId=${newThreadId}`);
    } catch (err) {
      console.error('Failed to handle inbox navigation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[style, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]} 
      onPress={handlePress} 
      disabled={isLoading || isChecking}
      activeOpacity={0.85}
    >
      {isLoading || isChecking ? (
        <ActivityIndicator size="small" color="#FFF" />
      ) : (
        <>
          {existingThreadId && <MessageSquareText size={16} color={textStyle?.color || '#FFF'} />}
          <Text style={[styles.text, textStyle]}>
            {existingThreadId ? 'Message' : 'Inbox'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13
  }
});
