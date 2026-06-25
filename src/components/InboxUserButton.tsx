import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useRouter } from 'expo-router';
import { Briefcase, Heart, Home, MessageSquareText, Users, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import 'react-native-get-random-values';

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
  const [showIntentPicker, setShowIntentPicker] = useState(false);
  const insets = useSafeAreaInsets();

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
      router.push(`/inboxDetail?threadId=${existingThreadId}&participantId=${targetUserId}`);
      return;
    }

    // Show intent picker if creating a new inbox
    setShowIntentPicker(true);
  };

  const createInboxWithIntent = async (intent: string) => {
    if (!currentUser?.id) return;

    setShowIntentPicker(false);
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
        router.push(`/inboxDetail?threadId=${existingInbox.id}&participantId=${targetUserId}`);
        return;
      }

      // 2. No inbox exists. Call the RPC to bypass RLS and create rows for both users safely
      const { data: newThreadId, error: rpcError } = await supabase
        .rpc('create_private_inbox', {
          target_user_id: targetUserId,
          intent_type: intent
        });

      if (rpcError || !newThreadId) {
        console.error('Error creating private inbox via RPC:', rpcError);
        return;
      }

      // 3. Navigate to the newly created inbox thread
      router.push(`/inboxDetail?threadId=${newThreadId}&participantId=${targetUserId}`);
    } catch (err) {
      console.error('Failed to handle inbox navigation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[style, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]}
        onPress={handlePress}
        disabled={isLoading || isChecking}
        activeOpacity={0.85}
      >
        {isLoading || isChecking ? (
          <Text style={[styles.text, textStyle]}>-</Text>
        ) : (
          <>
            {existingThreadId && <MessageSquareText size={16} color={textStyle?.color || '#FFF'} />}
            <Text style={[styles.text, textStyle]}>
              {existingThreadId ? 'Message' : 'Inbox'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <Modal visible={showIntentPicker} transparent animationType="slide" onRequestClose={() => setShowIntentPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.intentSheet, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}>
            <View style={styles.intentHeader}>
              <Text style={styles.intentTitle}>How would you like to connect?</Text>
              <TouchableOpacity onPress={() => setShowIntentPicker(false)}>
                <X size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
            <View style={styles.intentOptions}>
              <TouchableOpacity style={styles.intentBtn} onPress={() => createInboxWithIntent('relationship')}>
                <Heart color="#EF4444" size={24} />
                <Text style={styles.intentBtnText}>Relationship</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.intentBtn} onPress={() => createInboxWithIntent('friendship')}>
                <Users color="#3B82F6" size={24} />
                <Text style={styles.intentBtnText}>Friendship</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.intentBtn} onPress={() => createInboxWithIntent('family')}>
                <Home color="#A855F7" size={24} />
                <Text style={styles.intentBtnText}>Family</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.intentBtn} onPress={() => createInboxWithIntent('business')}>
                <Briefcase color="#F59E0B" size={24} />
                <Text style={styles.intentBtnText}>Business</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.intentBtn} onPress={() => createInboxWithIntent('other')}>
                <MessageSquareText color="#10B981" size={24} />
                <Text style={styles.intentBtnText}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  intentSheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  intentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  intentTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  intentOptions: {
    gap: 12,
  },
  intentBtn: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#262626',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  intentBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  }
});
