import { InboxSectionHeader } from '@/channel/widgets/sectionHeaders/InboxSectionHeader';
import UserAvatar from '@/components/avatar/UserAvatar';
import { InboxFullPageShimmer } from '@/components/shimmers/inboxPageShimmer/InboxFullPageShimmer';
import { useStyles } from "@/core/hooks/useStyles";
import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Image as ImageLucide, Sticker, Video } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Platform, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useChatStore } from '../application/useChatStore';
import { InboxThreadOptionsDialog } from '../components/InboxThreadOptionsDialog';
export const InboxFullPage = () => {
  const styles = useStyles(colors => ({
    root: {
      flex: 1,
      backgroundColor: colors.background
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      paddingTop: 52,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.muted
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '900'
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.muted
    },
    avatarWrapper: {
      marginRight: 16
    },
    content: {
      flex: 1
    },
    name: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 6
    },
    lastMsg: {
      color: colors.textSecondary,
      fontSize: 15
    },
    badge: {
      backgroundColor: '#FF3B30',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    badgeText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: 'bold'
    },
    empty: {
      padding: 40,
      alignItems: 'center',
      marginTop: 40
    },
    emptyImage: {
      width: 200,
      height: 200,
      marginBottom: 20
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 15,
      textAlign: 'center'
    }
  }));
  const router = useRouter();
  const {
    user
  } = useAuthStore() as any;
  const {
    threads,
    onlineUsers,
    typingUsers,
    fetchThreads,
    loadMoreThreads,
    isLoadingThreads,
    subscribeToGlobalPresence,
    subscribeToThread,
    unsubscribeFromThread
  } = useChatStore();
  const allThreads = [...threads];
  const profileCache = useProfileCacheStore(state => state.profiles);
  const [optionsDialogVisible, setOptionsDialogVisible] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [dialogAnchor, setDialogAnchor] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const {
    width
  } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  useEffect(() => {
    fetchThreads();
    subscribeToGlobalPresence();
  }, []);
  useEffect(() => {
    if (threads.length === 0) return;

    // Subscribe to the top 15 most recent threads to receive real-time typing indicators
    // and new messages directly on the Inbox list screen.
    const topThreads = threads.slice(0, 15);
    topThreads.forEach(t => {
      subscribeToThread(t.id);
    });
    return () => {
      // Clean up subscriptions when leaving the full page or when threads change significantly
      topThreads.forEach(t => {
        unsubscribeFromThread(t.id);
      });
    };
  }, [threads.map(t => t.id).join(',')]); // Re-run only if the actual list of threads changes

  return <View style={styles.root}>
    <View style={styles.header}>
      <Text style={styles.title}>Messages</Text>
    </View>

    <InboxSectionHeader threads={allThreads} />

    <FlatList data={allThreads} showsVerticalScrollIndicator={false} keyExtractor={t => t.id} refreshing={isLoadingThreads && allThreads.length > 0} onRefresh={fetchThreads} onEndReached={loadMoreThreads} onEndReachedThreshold={0.5} ListEmptyComponent={isLoadingThreads ? <InboxFullPageShimmer /> : <View style={styles.empty}>
      <Image source={require('../../../../assets/illustrations/undraw_love-messages_9oca.svg')} style={styles.emptyImage} contentFit="contain" />
      <Text style={styles.emptyTitle}>No Messages Yet</Text>
      <Text style={styles.emptyText}>Start a conversation with your friends!</Text>
    </View>} renderItem={({
      item
    }) => {
      const participant = item.participants.find((p: any) => p.id !== user?.id) || item.participants[0];
      const isCurrentlyTyping = (typingUsers[item.id] || []).some((id: string) => id === participant?.id);
      return <TouchableOpacity activeOpacity={1} style={styles.row} onPress={() => {
        if (isDesktop) {
          router.setParams({
            threadId: item.id
          });
        } else {
          router.push({
            pathname: '/inboxDetail',
            params: {
              threadId: item.id,
              participantId: participant?.id,
              participantNameFallback: participant?.displayName || participant?.username || 'User',
              participantAvatarFallback: participant?.profileImageUrl || undefined
            }
          });
        }
      }} onLongPress={e => {
        // Get page coordinates approximately
        const {
          pageX,
          pageY
        } = e.nativeEvent;
        setDialogAnchor({
          x: pageX,
          y: pageY
        });
        setSelectedThread(item.id);
        setOptionsDialogVisible(true);
      }}>
        <View style={styles.avatarWrapper}>
          <UserAvatar userId={participant?.id || ''} fallbackUrl={participant?.profileImageUrl} name={participant?.displayName} size={64} />
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{participant?.displayName || 'User'}</Text>
          {isCurrentlyTyping ? <View style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text style={[styles.lastMsg, {
              color: '#FFD700',
              fontStyle: 'italic',
              fontWeight: '500'
            }]} numberOfLines={1}>
              typing...
            </Text>
          </View> : item.lastMessage ? <View style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            {item.lastMessage.type === 'image' && <ImageLucide size={14} color={styles.lastMsg.color as string} style={{
              marginRight: 4
            }} />}
            {item.lastMessage.type === 'video' && <Video size={14} color={styles.lastMsg.color as string} style={{
              marginRight: 4
            }} />}
            {item.lastMessage.type === 'lottie' && <Sticker size={14} color={styles.lastMsg.color as string} style={{
              marginRight: 4
            }} />}
            <Text style={styles.lastMsg} numberOfLines={1}>
              {item.lastMessage.type === 'image' ? item.lastMessage.text || 'Photo' : item.lastMessage.type === 'video' ? item.lastMessage.text || 'Video' : item.lastMessage.type === 'lottie' ? item.lastMessage.text || 'Sticker' : item.lastMessage.type === 'audio' ? item.lastMessage.text || 'Voice message' : item.lastMessage.text || 'Started a conversation'}
            </Text>
          </View> : null}
        </View>
        {item.unreadCount > 0 && <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.unreadCount}</Text>
        </View>}
      </TouchableOpacity>;
    }} />
    <InboxThreadOptionsDialog visible={optionsDialogVisible} onClose={() => setOptionsDialogVisible(false)} anchor={dialogAnchor} onBlockPress={() => {
      console.log('Block', selectedThread);
      setOptionsDialogVisible(false);
    }} onMutePress={() => {
      console.log('Mute', selectedThread);
      setOptionsDialogVisible(false);
    }} onDeletePress={() => {
      console.log('Delete', selectedThread);
      setOptionsDialogVisible(false);
    }} />
  </View>;
};