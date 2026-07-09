import { supabase } from '@/core/supabase/client';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useRouter } from 'expo-router';
import { Briefcase, Heart, Home, MessageSquareText, Users, X } from 'lucide-react-native';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import 'react-native-get-random-values';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';
import { InboxDetailPage } from '@/features/messaging/pages/InboxDetailPage';

export interface InboxUserButtonProps {
  targetUserId: string;
  targetUserName?: string;
  targetUserAvatar?: string;
  style?: any;
  textStyle?: any;
  children?: React.ReactNode;
}

export const InboxUserButton: React.FC<InboxUserButtonProps> = ({ targetUserId, targetUserName, targetUserAvatar, style, textStyle, children }) => {
  const currentUser = useAuthStore(state => state.user);
  const router = useRouter();
  const styles = useStyles(themeStyles);
  const [isLoading, setIsLoading] = useState(false);
  const [existingThreadId, setExistingThreadId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [activeChatThread, setActiveChatThread] = useState<string | null>(null);
  const [showIntentPicker, setShowIntentPicker] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number; width: number } | null>(null);
  const insets = useSafeAreaInsets();
  const buttonRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

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
      if (isDesktop) {
        setActiveChatThread(existingThreadId);
      } else {
        router.push(`/inboxDetail?threadId=${existingThreadId}&participantId=${targetUserId}&participantNameFallback=${encodeURIComponent(targetUserName || '')}&participantAvatarFallback=${encodeURIComponent(targetUserAvatar || '')}`);
      }
      return;
    }

    // Show intent picker if creating a new inbox
    if (isDesktop && buttonRef.current && Platform.OS === 'web') {
      (buttonRef.current as any).measure((fx: number, fy: number, btnWidth: number, btnHeight: number, px: number, py: number) => {
        setMenuPosition({ x: px, y: py + btnHeight + 8, width: btnWidth });
        setShowIntentPicker(true);
      });
    } else {
      setShowIntentPicker(true);
    }
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
        if (isDesktop) {
          setActiveChatThread(existingInbox.id);
        } else {
          router.push(`/inboxDetail?threadId=${existingInbox.id}&participantId=${targetUserId}&participantNameFallback=${encodeURIComponent(targetUserName || '')}&participantAvatarFallback=${encodeURIComponent(targetUserAvatar || '')}`);
        }
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
      if (isDesktop) {
        setActiveChatThread(newThreadId);
      } else {
        router.push(`/inboxDetail?threadId=${newThreadId}&participantId=${targetUserId}&participantNameFallback=${encodeURIComponent(targetUserName || '')}&participantAvatarFallback=${encodeURIComponent(targetUserAvatar || '')}`);
      }
    } catch (err) {
      console.error('Failed to handle inbox navigation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
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

      <Modal visible={showIntentPicker} transparent animationType={isDesktop ? "fade" : "slide"} onRequestClose={() => setShowIntentPicker(false)}>
        <TouchableOpacity activeOpacity={1} style={isDesktop ? styles.desktopModalOverlay : styles.modalOverlay} onPress={() => setShowIntentPicker(false)}>
          <View 
            style={[
              styles.intentSheet, 
              isDesktop && menuPosition ? {
                position: 'absolute',
                top: menuPosition.y,
                // Center the menu relative to the button if it's wide, or just right align it
                right: Math.max(20, width - menuPosition.x - menuPosition.width),
                width: 200,
                paddingBottom: 16,
                padding: 12,
                borderRadius: 12,
              } : { 
                paddingBottom: Math.max(insets.bottom + 20, 40) 
              }
            ]}
          >
            <View style={styles.intentHeader}>
              <Text style={styles.intentTitle}>Connect via</Text>
              {!isDesktop && (
                <TouchableOpacity onPress={() => setShowIntentPicker(false)}>
                  <X size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView style={styles.intentOptions} contentContainerStyle={styles.intentOptionsContent}>
              <TouchableOpacity style={styles.intentBtn} onPress={() => createInboxWithIntent('relationship')}>
                <Heart color="#EF4444" size={20} />
                <Text style={styles.intentBtnText}>Relationship</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.intentBtn} onPress={() => createInboxWithIntent('friendship')}>
                <Users color="#3B82F6" size={20} />
                <Text style={styles.intentBtnText}>Friendship</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.intentBtn} onPress={() => createInboxWithIntent('family')}>
                <Home color="#A855F7" size={20} />
                <Text style={styles.intentBtnText}>Family</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.intentBtn} onPress={() => createInboxWithIntent('business')}>
                <Briefcase color="#F59E0B" size={20} />
                <Text style={styles.intentBtnText}>Business</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.intentBtn} onPress={() => createInboxWithIntent('other')}>
                <MessageSquareText color="#10B981" size={20} />
                <Text style={styles.intentBtnText}>Other</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {isDesktop && activeChatThread && (
        <Modal visible={true} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 20 }}>
            <View style={{ 
              width: 400, 
              height: '80%', 
              backgroundColor: styles.intentSheet.backgroundColor, 
              borderRadius: 16, 
              overflow: 'hidden', 
              shadowColor: styles.intentSheet.shadowColor, 
              shadowOffset: { width: 0, height: 4 }, 
              shadowOpacity: 0.15, 
              shadowRadius: 24, 
              elevation: 10
            }}>
              <InboxDetailPage 
                threadId={activeChatThread} 
                participantId={targetUserId} 
                participantNameFallback={targetUserName}
                participantAvatarFallback={targetUserAvatar}
                isOverlay 
                onClose={() => setActiveChatThread(null)} 
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => StyleSheet.create({
  text: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13 * scale
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  desktopModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  intentSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20 * scale,
    borderTopRightRadius: 20 * scale,
    padding: 16 * scale,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: -4 * scale },
    shadowOpacity: 0.1,
    shadowRadius: 12 * scale,
    elevation: 8,
  },
  intentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16 * scale,
  },
  intentTitle: {
    color: colors.text,
    fontSize: 16 * scale,
    fontWeight: '800',
  },
  intentOptions: {
    maxHeight: 250 * scale,
  },
  intentOptionsContent: {
    gap: 8 * scale,
  },
  intentBtn: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12 * scale,
    padding: 12 * scale,
    alignItems: 'center',
    gap: 12 * scale,
  },
  intentBtnText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14 * scale,
  }
});
