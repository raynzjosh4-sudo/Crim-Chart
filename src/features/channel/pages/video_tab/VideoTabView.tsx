import { useStyles } from "@/core/hooks/useStyles";
import { useChannelMoments } from '@/channel/hooks/useChannelMoments';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
import { useDesktopComposeStore } from '@/core/store/useDesktopComposeStore';
import { VideoTabShimmer } from './widgets/VideoTabShimmer';
import { PromotionBannerCard } from './widgets/PromotionBannerCard';
import { StatusGroup, StatusViewer } from '@/channel/pages/widgets2/status/StatusViewer';
import { Image } from 'expo-image';

interface VideoTabViewProps {
  channelId?: string;
  channelName?: string;
  channelTitle?: string;
  isLoading?: boolean;
}

const HEIGHTS = [220, 300, 260, 340, 210, 290, 250, 320, 230, 310, 270, 350];

export const VideoTabView: React.FC<VideoTabViewProps> = ({
  channelId,
  channelName,
  channelTitle,
  isLoading = false
}) => {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    grid: {
      flexDirection: 'row',
      paddingHorizontal: 8,
      paddingTop: 12,
      paddingBottom: 20,
      gap: 8
    },
    column: {
      flex: 1
    },
    cardWrapper: {
      marginBottom: 8,
      width: '100%'
    },
    noVideosContainer: {
      height: 300,
      justifyContent: 'center',
      alignItems: 'center'
    },
    noVideosText: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.5)',
      fontWeight: 'bold'
    },
    postCardContainer: {
      width: '100%',
      height: HEIGHTS[0],
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#111',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.background,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 8
    },
    postCardImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      opacity: 0.5
    },
    postCardOverlay: {
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.text,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8
    },
    postCardText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4
    },
    postCardChannel: {
      position: 'absolute',
      bottom: 12,
      color: 'rgba(255,255,255,0.8)',
      fontSize: 10,
      fontWeight: '600',
      paddingHorizontal: 12
    }
  }));

  const router = useRouter();
  const { user } = useAuthStore();
  const { momentGroups, loading: statusesLoading } = useChannelMoments(user?.id || '', channelId);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [initialViewerIndex, setInitialViewerIndex] = useState(0);

  const moments = momentGroups.flatMap(group => group.moments.map(m => ({
    id: m.id,
    mediaUrl: m.media_url,
    caption: m.caption || '',
    authorName: group.channel_name || '',
    authorAvatarUrl: group.channel_avatar_url || '',
    thumbnailUrl: m.media_url // fallback if no thumbnail
  })));

  const statusGroups: StatusGroup[] = moments.map(m => ({
    id: m.id,
    channelName: m.authorName || channelName || 'Moment',
    avatarUrl: m.authorAvatarUrl || 'https://i.pravatar.cc/150',
    media: [{
      id: m.id,
      url: m.mediaUrl,
      type: 'image', // Adjust type if video moments are supported
      caption: m.caption
    }]
  }));

  const handlePostMoment = () => {
    if (Platform.OS === 'web') {
      useDesktopComposeStore.getState().openModal({
        postType: 'channel_moment',
        targetChannelId: channelId
      });
    } else {
      router.push({
        pathname: '/first-post',
        params: {
          targetChannelId: channelId,
          isChannelMoment: 'true'
        }
      } as any);
    }
  };

  const handleMomentPress = (momentId: string) => {
    const idx = moments.findIndex(m => m.id === momentId);
    setInitialViewerIndex(idx !== -1 ? idx : 0);
    setViewerVisible(true);
  };

  if (isLoading || statusesLoading) {
    return <VideoTabShimmer />;
  }

  // We place the 'Add Moment' card in the left column (index 0)
  const leftColumnMoments = moments.filter((_, i) => i % 2 !== 0); // 1, 3, 5
  const rightColumnMoments = moments.filter((_, i) => i % 2 === 0); // 0, 2, 4

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {/* Left Column */}
          <View style={styles.column}>
            {/* Add Moment Card */}
            <View style={styles.cardWrapper}>
              <TouchableOpacity activeOpacity={0.8} onPress={handlePostMoment} style={styles.postCardContainer}>
                {user?.profileImageUrl ? (
                  <Image source={{ uri: user.profileImageUrl }} style={styles.postCardImage} />
                ) : (
                  <View style={[styles.postCardImage, { backgroundColor: '#333' }]} />
                )}
                <View style={styles.postCardOverlay}>
                  <View style={styles.iconCircle}>
                    <Image source={require('../../../../../assets/appicon/big-sized-app-icon.png')} style={{ width: 32, height: 32, borderRadius: 8 }} contentFit="contain" />
                  </View>
                  <Text style={styles.postCardText}>Add Moment</Text>
                </View>
                <Text style={styles.postCardChannel} numberOfLines={1}>{channelName}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Left Column Moments */}
            {leftColumnMoments.map((moment, index) => {
              const globalIndex = index * 2 + 1; // 1, 3, 5...
              return (
                <View key={moment.id} style={[styles.cardWrapper, { height: HEIGHTS[globalIndex % HEIGHTS.length] }]}>
                  <TouchableOpacity activeOpacity={0.9} style={{ flex: 1 }} onPress={() => handleMomentPress(moment.id)}>
                    <PromotionBannerCard moment={moment as any} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {rightColumnMoments.map((moment, index) => {
              const globalIndex = index * 2; // 0, 2, 4... (shifted because of Add Moment)
              // Wait, right column should use heights 1, 3, 5 or 2, 4, 6.
              // Let's use globalIndex + 1 for height to stagger
              return (
                <View key={moment.id} style={[styles.cardWrapper, { height: HEIGHTS[(globalIndex + 1) % HEIGHTS.length] }]}>
                  <TouchableOpacity activeOpacity={0.9} style={{ flex: 1 }} onPress={() => handleMomentPress(moment.id)}>
                    <PromotionBannerCard moment={moment as any} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <StatusViewer 
        visible={viewerVisible} 
        onClose={() => setViewerVisible(false)} 
        statusGroups={statusGroups} 
        initialGroupIndex={initialViewerIndex} 
      />
    </View>
  );
};