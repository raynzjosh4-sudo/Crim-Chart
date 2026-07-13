import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import AppAvatar from '@/components/avatar/AppAvatar';

import { useRouter } from 'expo-router';
import { StatusViewer } from '../../pages/widgets2/status/StatusViewer';
import { useChannelMoments } from '../../hooks/useChannelMoments';
import { ChannelModel } from '@/channel/models/ChannelModel';

interface ChannelStatusMomentsProps {
  displayedChannels?: ChannelModel[];
}

export const ChannelStatusMoments: React.FC<ChannelStatusMomentsProps> = ({ displayedChannels }) => {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  
  const [viewerVisible, setViewerVisible] = React.useState(false);
  const [initialViewerIndex, setInitialViewerIndex] = React.useState(0);

  // Use the new highly-scalable paginated moments hook!
  const { momentGroups, fetchMoments, hasMore } = useChannelMoments(user?.id || '');

  React.useEffect(() => {
    if (user?.id) {
      fetchMoments(true);
    }
  }, [user?.id, fetchMoments]);

  // Filter moments based on the channels currently shown on screen
  const filteredGroups = displayedChannels 
    ? momentGroups.filter(g => displayedChannels.some(c => c.id === g.channel_id))
    : momentGroups;

  // Map the SQL JSON output to the viewer's required data format
  const statusGroups = filteredGroups.map(group => ({
    id: group.channel_id,
    channelName: group.channel_name,
    avatarUrl: group.channel_avatar_url || 'https://i.pravatar.cc/151',
    media: group.moments.map(m => ({
      id: m.id,
      authorId: m.author_id || group.channel_id,
      url: m.media_url,
      type: m.media_type as 'image' | 'video',
      caption: m.caption || ''
    }))
  }));

  const openViewer = (index: number) => {
    setInitialViewerIndex(index);
    setViewerVisible(true);
  };

  const loadMoreMoments = () => {
    if (hasMore) {
      fetchMoments(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Create Channel Card */}
        <TouchableOpacity activeOpacity={1} style={styles.card} onPress={() => {
          if (Platform.OS === 'web' && window.innerWidth >= 768) {
            router.setParams({ desktopChannelId: 'create' });
          } else {
            router.push('/channel/create' as any);
          }
        }}>
          <View style={styles.createCardContent}>
            <Text style={styles.statusLabelTop}>Create</Text>
            
            <View style={styles.createAvatarWrapper}>
              <AppAvatar imageUrl={user?.profileImageUrl} size={58} />
              <View style={styles.plusBadge}>
                <Plus size={14} color="#FFF" />
              </View>
            </View>

            <Text style={styles.statusLabelBottom}>Channel</Text>
          </View>
        </TouchableOpacity>

        {/* Channel Status Cards */}
        {momentGroups.map((group, index) => {
          // Display the thumbnail of the most recent moment as the cover image
          const coverImage = group.moments[group.moments.length - 1]?.thumbnail_url || group.moments[group.moments.length - 1]?.media_url;

          return (
            <TouchableOpacity activeOpacity={1} key={group.channel_id} style={styles.card} onPress={() => openViewer(index)}>
              <ExpoImage source={{ uri: coverImage }} style={styles.cardImage} contentFit="cover" />
              <View style={styles.gradient} />
              <View style={styles.avatarRing}>
                <ExpoImage source={{ uri: group.channel_avatar_url || 'https://i.pravatar.cc/151' }} style={styles.userAvatar} />
              </View>
              <Text style={styles.authorName} numberOfLines={1}>{group.channel_name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* New Interactive Status Viewer */}
      <StatusViewer
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        statusGroups={statusGroups}
        initialGroupIndex={initialViewerIndex}
      />
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
  },
  card: {
    width: 100,
    height: 160,
    backgroundColor: '#000',
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  createCardContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  createAvatarWrapper: {
    position: 'relative',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  statusLabelTop: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '900',
  },
  statusLabelBottom: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '900',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  avatarRing: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  authorName: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    fontSize: 13,
    color: '#FFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
