import { useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useChatStore } from '../application/useChatStore';
import { InboxSectionHeader, BouncingTypingIndicator } from '@/channel/widgets/sectionHeaders/InboxSectionHeader';
import UserAvatar from '@/components/avatar/UserAvatar';
import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';
import { InboxFullPageShimmer } from '@/components/shimmers/inboxPageShimmer/InboxFullPageShimmer';
import { InboxThreadOptionsDialog } from '../components/InboxThreadOptionsDialog';
import { Image as ImageLucide, Video, Sticker } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export const InboxFullPage = () => {
  const router = useRouter();
  const { user } = useAuthStore() as any;
  const { threads, onlineUsers, fetchThreads, loadMoreThreads, isLoadingThreads, subscribeToGlobalPresence } = useChatStore();

  const allThreads = [...threads];
  const profileCache = useProfileCacheStore(state => state.profiles);

  const [optionsDialogVisible, setOptionsDialogVisible] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [dialogAnchor, setDialogAnchor] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    fetchThreads();
    subscribeToGlobalPresence();
  }, []);

  // useEffect(() => {
  //   if (allThreads.length === 0) return;
  //   console.log('\n\n================ DEBUG INBOX USERS ================');
  //   allThreads.forEach(t => {
  //     const p = t.participants[0];
  //     if (p) {
  //       const cache = profileCache[p.id];
  //       console.log(`Name: ${p.displayName}`);
  //       console.log(`ID: ${p.id}`);
  //       console.log(`Is Online: ${cache?.isOnline}`);
  //       console.log(`Last Seen: ${cache?.lastSeen}`);
  //       console.log(`Has Status: ${cache?.hasStatus}`);
  //       console.log(`Status Count: ${cache?.statusCount}`);
  //       console.log('===================================================');
  //     }
  //   });
  // }, [allThreads, profileCache]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <InboxSectionHeader threads={allThreads} />

      <FlatList
        data={allThreads}
        keyExtractor={t => t.id}
        refreshing={isLoadingThreads && allThreads.length > 0}
        onRefresh={fetchThreads}
        onEndReached={loadMoreThreads}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoadingThreads ? (
            <InboxFullPageShimmer />
          ) : (
            <View style={styles.empty}>
              <Image 
                source={require('../../../../assets/illustrations/undraw_love-messages_9oca.svg')} 
                style={styles.emptyImage} 
                contentFit="contain"
              />
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptyText}>Start a conversation with your friends!</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const participant = item.participants.find((p: any) => p.id !== user?.id) || item.participants[0];
          return (
            <TouchableOpacity activeOpacity={1}
              style={styles.row}
              onPress={() => router.push({ pathname: '/inboxDetail', params: { threadId: item.id } })}
              onLongPress={(e) => {
                // Get page coordinates approximately
                const { pageX, pageY } = e.nativeEvent;
                setDialogAnchor({ x: pageX, y: pageY });
                setSelectedThread(item.id);
                setOptionsDialogVisible(true);
              }}
            >
              <View style={styles.avatarWrapper}>
                <UserAvatar
                  userId={participant?.id || ''}
                  fallbackUrl={participant?.profileImageUrl}
                  name={participant?.displayName}
                  size={64}
                />
              </View>
              <View style={styles.content}>
                <Text style={styles.name}>{participant?.displayName || 'User'}</Text>
                {item.lastMessage ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {item.lastMessage.type === 'image' && <ImageLucide size={14} color="rgba(255,255,255,0.6)" style={{ marginRight: 4 }} />}
                    {item.lastMessage.type === 'video' && <Video size={14} color="rgba(255,255,255,0.6)" style={{ marginRight: 4 }} />}
                    {item.lastMessage.type === 'lottie' && <Sticker size={14} color="rgba(255,255,255,0.6)" style={{ marginRight: 4 }} />}
                    <Text style={styles.lastMsg} numberOfLines={1}>
                      {item.lastMessage.type === 'image' ? (item.lastMessage.text || 'Photo') :
                       item.lastMessage.type === 'video' ? (item.lastMessage.text || 'Video') :
                       item.lastMessage.type === 'lottie' ? (item.lastMessage.text || 'Sticker') :
                       item.lastMessage.type === 'audio' ? (item.lastMessage.text || 'Voice message') :
                       (item.lastMessage.text || 'Started a conversation')}
                    </Text>
                  </View>
                ) : null}
              </View>
              {item.unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
      <InboxThreadOptionsDialog
        visible={optionsDialogVisible}
        onClose={() => setOptionsDialogVisible(false)}
        anchor={dialogAnchor}
        onBlockPress={() => {
          console.log('Block', selectedThread);
          setOptionsDialogVisible(false);
        }}
        onMutePress={() => {
          console.log('Mute', selectedThread);
          setOptionsDialogVisible(false);
        }}
        onDeletePress={() => {
          console.log('Delete', selectedThread);
          setOptionsDialogVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 52, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' },
  title: { color: '#FFF', fontSize: 26, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' },
  avatarWrapper: { marginRight: 16 },
  content: { flex: 1 },
  name: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  lastMsg: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  badge: { backgroundColor: '#FF3B30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  empty: { padding: 40, alignItems: 'center', marginTop: 40 },
  emptyImage: { width: 200, height: 200, marginBottom: 20 },
  emptyTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, textAlign: 'center' },
});
