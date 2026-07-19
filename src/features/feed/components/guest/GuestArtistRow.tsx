import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/core/theme/app_theme';
import { GuestArtistRow as GuestArtistRowModel } from '@/features/feed/data/sources/FeedRemoteSource';
import { PostEntity } from '@/features/feed/domain/entities/PostEntity';
import { FollowUserButton } from '@/components/FollowUserButton';
import { RequireAuthWrapper } from '@/components/wrappers/RequireAuthWrapper';
import { ProfileMusicItem } from '@/components/profileTabsWidgets/ProfileMusicItem';
import { useDesktopNowPlayingStore } from '@/core/store/useDesktopNowPlayingStore';

interface GuestArtistRowProps {
  artist: GuestArtistRowModel;
}

export const GuestArtistRow = React.memo(({ artist }: GuestArtistRowProps) => {
  const { colors } = useAppTheme();
  const router = useRouter();

  const handleMusicPress = (post: PostEntity) => {
    const queue = artist.posts.map(p => ({
      title: p.caption?.trim() || 'Untitled',
      artist: p.author?.displayName || p.author?.username || 'Unknown Artist',
      coverUrl: p.imageUrls?.[0] || p.thumbnailUrls?.[0] || '',
      audioUrl: p.audioUrl || '',
      lyrics: p.metadata?.lyrics || '',
      postId: p.id,
    }));
    const startIndex = Math.max(0, artist.posts.findIndex(p => p.id === post.id));
    useDesktopNowPlayingStore.getState().openModal(queue, startIndex);
  };

  const renderCard = ({ item }: { item: PostEntity }) => {
    const thumbnailUrl = item.imageUrls?.[0] || item.thumbnailUrls?.[0] || '';
    return (
      <View style={{ marginRight: 6 }}>
        <ProfileMusicItem
          thumbnailUrl={thumbnailUrl}
          title={item.caption?.trim() || 'Untitled'}
          artist={item.author?.displayName || item.author?.username || 'Unknown Artist'}
          size={148}
          onPress={() => handleMusicPress(item)}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Row Header: avatar + name + follow button */}
      <View style={styles.header}>
        <RequireAuthWrapper>
          {({ checkAuth }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.authorInfo}
              onPress={() => checkAuth(() => router.push(`/profile/${artist.authorId}` as any))}
            >
              {/* Avatar */}
              {artist.authorAvatar ? (
                <ExpoImage
                  source={{ uri: artist.authorAvatar }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primary + '33' }]}>
                  <User size={20} color={colors.primary} />
                </View>
              )}

              {/* Name */}
              <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>
                {artist.authorName}
              </Text>
            </TouchableOpacity>
          )}
        </RequireAuthWrapper>

        {/* Follow Button — already has RequireAuthWrapper inside */}
        <FollowUserButton targetUserId={artist.authorId} size="small" />
      </View>

      {/* Horizontal Music Cards */}
      <FlatList
        data={artist.posts}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={160}
        decelerationRate="fast"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistName: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingRight: 8,
  },
});
