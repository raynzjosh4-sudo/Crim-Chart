import { supabase } from '@/core/supabase/supabaseConfig';
import { useChatStore } from '@/features/messaging/application/useChatStore';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserAvatarImage } from '@/channel/pages/widgets2/memberimage/UserAvatarImage';

type InboxUserMapped = {
  id: string;
  threadId: string;
  name: string;
  avatarUrl: string;
  isTyping: boolean;
  isActive: boolean;
  hasStatus: boolean;
};

export const BouncingTypingIndicator = () => {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (anim: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: -5, duration: 300, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.delay(600),
          ])
        )
      ]);
    };

    Animated.parallel([
      createBounce(anim1, 0),
      createBounce(anim2, 200),
      createBounce(anim3, 400),
    ]).start();
  }, []);

  return (
    <View style={styles.typingBubble}>
      <Animated.View style={[styles.dot, { transform: [{ translateY: anim1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: anim2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: anim3 }] }]} />
    </View>
  );
};

export interface InboxSectionHeaderProps {
  threads: any[];
}

export const InboxSectionHeader: React.FC<InboxSectionHeaderProps> = ({ threads }) => {
  const router = useRouter();

  const { typingUsers, onlineUsers } = useChatStore();

  const sortedUsers = React.useMemo(() => {
    const mapped: InboxUserMapped[] = threads.map(t => {
      const p = t.participants[0];
      const isCurrentlyTyping = (typingUsers[t.id] || []).some((id: string) => id === p?.id);
      
      return {
        id: p?.id || t.id,
        threadId: t.id,
        name: p?.displayName || 'User',
        avatarUrl: p?.profileImageUrl || '',
        isTyping: isCurrentlyTyping || t.isTyping || false,
        isActive: p?.id ? onlineUsers[p.id] : p?.isActive || false,

        hasStatus: p?.hasStatus || false,
      };
    });

    const typingList: InboxUserMapped[] = [];
    const activeList: InboxUserMapped[] = [];
    const hasStatusList: InboxUserMapped[] = [];
    const rest: InboxUserMapped[] = [];

    mapped.forEach(user => {
      if (user.isTyping) typingList.push(user);
      else if (user.isActive) activeList.push(user);
      else if (user.hasStatus) hasStatusList.push(user);
      else rest.push(user);
    });

    return [...typingList, ...activeList, ...hasStatusList, ...rest];
  }, [threads, typingUsers, onlineUsers]);

  if (sortedUsers.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {sortedUsers.map(user => (
          <TouchableOpacity
            key={user.id}
            style={styles.userCol}
            onPress={() => router.push({ pathname: '/inboxDetail', params: { threadId: user.threadId } })}
          >
            <View style={styles.avatarWrapper}>
              <UserAvatarImage
                imageUrl={user.avatarUrl}
                size={68}
                showStatusRing={user.hasStatus}
                showActiveDot={user.isActive}
                name={user.name}
              />

              {user.isTyping && (
                <View style={styles.typingContainer}>
                  <BouncingTypingIndicator />
                </View>
              )}
            </View>
            <Text style={styles.nameText} numberOfLines={1}>
              {user.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 126,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  userCol: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatarWrapper: {
    width: 74,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typingContainer: {
    position: 'absolute',
    bottom: -4,
  },
  typingBubble: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 4,
    flexDirection: 'row',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF',
    marginHorizontal: 1.5,
  },
  nameText: {
    width: 64,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
});
