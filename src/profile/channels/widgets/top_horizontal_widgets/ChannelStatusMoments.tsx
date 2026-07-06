import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Plus, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useFeedStore } from '@/core/store/useFeedStore';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

export const ChannelStatusMoments = () => {
  const router = useRouter();
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const { user } = useAuthStore();
  const { items, isLoading } = useFeedStore(); // Mimicking joinedMomentsProvider

  // Group moments by channelId
  const groupedMoments = useMemo(() => {
    const groups: Record<string, any[]> = {};
    items.forEach(moment => {
      const channelId = moment.channel_id || moment.channelId;
      if (!channelId) return;
      if (!groups[channelId]) {
        groups[channelId] = [];
      }
      groups[channelId].push(moment);
    });
    return groups;
  }, [items]);

  const channelIdsWithMoments = Object.keys(groupedMoments);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} style={[styles.statusCard, { backgroundColor: theme.colors.surface }]} />
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
        {/* Create Card */}
        <TouchableOpacity activeOpacity={1} 
          style={styles.createCard} 
          onPress={() => router.push('/channel-create' as any)}
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
                  <Users color="rgba(255,255,255,0.24)" size={30} />
                </View>
              )}
            </View>
            <View style={styles.addButton}>
              <Plus size={14} color={theme.colors.onPrimary} />
            </View>
          </View>
          <Text style={styles.createLabelTop}>Create</Text>
          <Text style={styles.createLabelBottom}>Channel</Text>
        </TouchableOpacity>

        {/* Moment Cards */}
        {channelIdsWithMoments.map((channelId) => {
          const moments = groupedMoments[channelId];
          const latestMoment = moments[0];
          const channelName = latestMoment.channel_name || latestMoment.channelName || latestMoment.authorName || 'Channel';
          const avatarUrl = latestMoment.channel_avatar_url || latestMoment.channelAvatarUrl || latestMoment.authorAvatarUrl;
          const primaryImageUrl = latestMoment.thumbnailUrl || latestMoment.mediaUrl || latestMoment.video_url;

          // React Native doesn't have a direct CustomPainter equivalent without react-native-svg
          // We simulate the segmented ring using dashed borders for multiple moments
          const ringStyle = moments.length > 1 
            ? { borderStyle: 'dashed' as const } 
            : { borderStyle: 'solid' as const };

          return (
            <TouchableOpacity activeOpacity={1} 
              key={channelId} 
              style={styles.statusCard}
              onPress={() => router.push({ pathname: '/status/[id]', params: { id: latestMoment.id } } as any)}
            >
              {primaryImageUrl && (
                <Image 
                  source={{ uri: primaryImageUrl }} 
                  style={styles.cardBackground}
                />
              )}
              <View style={styles.cardOverlay} />
              
              <View style={styles.cardAvatarContainer}>
                <View style={[styles.cardAvatarRing, ringStyle]}>
                  {avatarUrl ? (
                    <Image 
                      source={{ uri: avatarUrl }} 
                      style={styles.cardAvatar}
                    />
                  ) : (
                    <View style={[styles.cardAvatar, styles.placeholderAvatar]}>
                      <Text style={styles.avatarInitials}>{channelName[0].toUpperCase()}</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.channelName} numberOfLines={1}>
                {channelName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const themeStyles = (colors: ThemeTokens) => StyleSheet.create({
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
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surfaceVariant,
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: colors.text,
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
  createLabelTop: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '900',
    position: 'absolute',
    top: 12,
  },
  createLabelBottom: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '900',
    position: 'absolute',
    bottom: 12,
  },
  statusCard: {
    width: 100,
    height: 160,
    borderRadius: 16,
    backgroundColor: colors.background,
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
    borderColor: colors.primary,
  },
  cardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  channelName: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
