import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Plus, User as UserIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useFeedStore } from '@/core/store/useFeedStore';

export const UserStatusWidget = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Using useFeedStore to mimic joinedStatusesProvider from Riverpod
  const { items, isLoading } = useFeedStore(); 

  // Group statuses by authorId to show individual user statuses
  const groupedStatuses = useMemo(() => {
    const groups: Record<string, any[]> = {};
    items.forEach(status => {
      const authorId = status.author_id || status.authorId;
      if (!authorId) return;
      if (!groups[authorId]) {
        groups[authorId] = [];
      }
      groups[authorId].push(status);
    });
    return groups;
  }, [items]);

  const authorIdsWithStatuses = Object.keys(groupedStatuses);

  // Shimmer effect placeholder
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} style={[styles.statusCard, { backgroundColor: '#333' }]} />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Create Status Card */}
        <TouchableOpacity 
          style={styles.createCard} 
          onPress={() => router.push('/post' as any)}
        >
          <View style={styles.createAvatarContainer}>
            <View style={styles.avatarCircle}>
              {user?.profileImageUrl ? (
                <Image 
                  source={{ uri: user.profileImageUrl }} 
                  style={styles.meAvatar}
                />
              ) : (
                <View style={[styles.meAvatar, styles.placeholderAvatar]}>
                  <UserIcon color="rgba(255,255,255,0.24)" size={30} />
                </View>
              )}
            </View>
            <View style={styles.addButton}>
              <Plus size={14} color="#000" />
            </View>
          </View>
          <Text style={styles.cardLabel}>Status</Text>
        </TouchableOpacity>

        {/* Status Cards */}
        {authorIdsWithStatuses.map((authorId) => {
          const userStatuses = groupedStatuses[authorId];
          const latestStatus = userStatuses[0];
          const authorName = latestStatus.author_username || latestStatus.authorUsername || 'User';
          const avatarUrl = latestStatus.author_avatar_url || latestStatus.authorAvatarUrl;
          const primaryImageUrl = latestStatus.primaryImageUrl || latestStatus.image_urls?.[0];

          return (
            <TouchableOpacity 
              key={authorId} 
              style={styles.statusCard}
              onPress={() => router.push({ pathname: '/status/[id]', params: { id: latestStatus.id } } as any)}
            >
              {primaryImageUrl && (
                <Image 
                  source={{ uri: primaryImageUrl }} 
                  style={styles.cardBackground}
                />
              )}
              <View style={styles.cardOverlay} />
              
              <View style={styles.cardAvatarContainer}>
                <View style={styles.cardAvatarRing}>
                  {avatarUrl ? (
                    <Image 
                      source={{ uri: avatarUrl }} 
                      style={styles.cardAvatar}
                    />
                  ) : (
                    <View style={[styles.cardAvatar, styles.placeholderAvatar]}>
                      <Text style={styles.avatarInitials}>{authorName[0].toUpperCase()}</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.authorName} numberOfLines={1}>
                {authorName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 175,
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  createCard: {
    width: 100,
    height: 160,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    padding: 2,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255, 184, 0, 0.5)',
  },
  meAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#111',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 4,
  },
  cardLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 12,
  },
  statusCard: {
    width: 100,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardAvatarContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  cardAvatarRing: {
    padding: 2,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFB800',
  },
  cardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  authorName: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
