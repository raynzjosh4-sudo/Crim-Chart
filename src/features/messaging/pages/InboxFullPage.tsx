import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useChatStore } from '../application/useChatStore';
import { InboxSectionHeader, BouncingTypingIndicator } from '@/channel/widgets/sectionHeaders/InboxSectionHeader';
import { UserAvatarImage } from '@/channel/pages/widgets2/memberimage/UserAvatarImage';


export const InboxFullPage = () => {
  const router = useRouter();
  const { threads, onlineUsers, fetchThreads, isLoadingThreads, subscribeToGlobalPresence } = useChatStore();

  const allThreads = [...threads]; // Removed DUMMY_THREADS_LIST to only show real threads

  useEffect(() => {
    fetchThreads();
    subscribeToGlobalPresence();
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <InboxSectionHeader threads={allThreads} />

      <FlatList
        data={allThreads}
        keyExtractor={t => t.id}
        refreshing={isLoadingThreads}
        onRefresh={fetchThreads}
        renderItem={({ item }) => {
          const participant = item.participants[0];
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push({ pathname: '/inboxDetail', params: { threadId: item.id } })}
            >
              <View style={styles.avatarWrapper}>
                <UserAvatarImage
                  imageUrl={participant?.profileImageUrl}
                  size={64}
                  showStatusRing={participant?.hasStatus}
                  showActiveDot={participant?.id ? onlineUsers[participant.id] : false}
                  name={participant?.displayName}
                />
              </View>
              <View style={styles.content}>
                <Text style={styles.name}>{participant?.displayName || 'User'}</Text>
                {item.lastMessage?.text ? (
                  <Text style={styles.lastMsg} numberOfLines={1}>
                    {item.lastMessage.text}
                  </Text>
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
        ListEmptyComponent={
          !isLoadingThreads ? (
            <View style={styles.empty}><Text style={styles.emptyText}>No messages yet</Text></View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { padding: 16, paddingTop: 52, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' },
  title: { color: '#FFF', fontSize: 26, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' },
  avatarWrapper: { marginRight: 16 },
  content: { flex: 1 },
  name: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  lastMsg: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  badge: { backgroundColor: '#FACD11', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, minWidth: 28, alignItems: 'center' },
  badgeText: { color: '#000', fontSize: 14, fontWeight: '900' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 16 },
});
