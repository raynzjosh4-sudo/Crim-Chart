import { useStyles } from "@/core/hooks/useStyles";
import { StatusGroup, StatusViewer } from '@/channel/pages/widgets2/status/StatusViewer';
import { supabase } from '@/core/supabase/supabaseConfig';
import { colors } from '@/core/theme/colors';
import { MomentData } from '@/data/mockVideoData';
import { Plus } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { PromotionBannerCard } from './PromotionBannerCard';
const ITEM_WIDTH = 100; // Matching PromotionBannerCard width
const ITEM_MARGIN = 6;
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_MARGIN * 2;
interface VideoPromotionBannerProps {
  channelName?: string;
  channelTitle?: string;
  onPostMoment: () => void;
  moments?: MomentData[];
}
export const VideoPromotionBanner = ({
  channelName,
  channelTitle,
  onPostMoment,
  moments = []
}: VideoPromotionBannerProps) => {
  const styles = useStyles(colors => ({
    container: {
      paddingVertical: 12
    },
    title: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.text,
      paddingHorizontal: 20,
      marginBottom: 12
    },
    emptyContainer: {
      paddingHorizontal: 20,
      alignItems: 'center',
      marginBottom: 20
    },
    carouselContent: {
      paddingHorizontal: 14
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      lineHeight: 24
    },
    highlight: {
      color: colors.primary
    },
    description: {
      fontSize: 12,
      fontWeight: '500',
      color: 'rgba(255,255,255,0.6)',
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 20
    },
    postCardContainer: {
      width: 100,
      height: 140,
      borderRadius: 16,
      overflow: 'hidden',
      marginHorizontal: 6,
      backgroundColor: '#111',
      alignItems: 'center',
      justifyContent: 'center'
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
      textShadowOffset: {
        width: 0,
        height: 1
      },
      textShadowRadius: 4
    },
    postCardChannel: {
      position: 'absolute',
      bottom: 12,
      color: 'rgba(255,255,255,0.8)',
      fontSize: 10,
      fontWeight: '600',
      paddingHorizontal: 12
    },
    invisibleButton: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0
    }
  }));
  const isEmpty = moments.length === 0;
  const scrollX = useRef(new Animated.Value(0)).current;
  const [userAvatar, setUserAvatar] = React.useState(null as string | null);

  // Status Viewer state
  const [viewerVisible, setViewerVisible] = React.useState(false);
  const [initialViewerIndex, setInitialViewerIndex] = React.useState(0);

  // Map moments to StatusGroups
  const statusGroups: StatusGroup[] = moments.map(m => ({
    id: m.id,
    channelName: m.authorName || channelName || 'Moment',
    avatarUrl: m.authorAvatarUrl || 'https://i.pravatar.cc/150',
    media: [{
      id: m.id,
      url: m.mediaUrl,
      type: 'image',
      caption: m.caption
    }]
  }));
  React.useEffect(() => {
    supabase.auth.getUser().then(({
      data
    }) => {
      setUserAvatar(data.user?.user_metadata?.avatar_url || null);
    });
  }, []);

  // Prepend a "Post" item to the data array
  const listData = [{
    isPostCard: true,
    id: 'post-card'
  }, ...moments];
  return <View style={styles.container}>
      <Animated.FlatList data={listData} keyExtractor={item => item.id} horizontal showsHorizontalScrollIndicator={false} snapToInterval={SNAP_INTERVAL} decelerationRate="fast" contentContainerStyle={styles.carouselContent} onScroll={Animated.event([{
      nativeEvent: {
        contentOffset: {
          x: scrollX
        }
      }
    }], {
      useNativeDriver: true
    })} renderItem={({
      item,
      index
    }) => {
      const inputRange = [(index - 1) * SNAP_INTERVAL, index * SNAP_INTERVAL, (index + 1) * SNAP_INTERVAL];
      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.9, 1, 0.9],
        extrapolate: 'clamp'
      });
      if ((item as any).isPostCard) {
        return <Animated.View style={{
          transform: [{
            scale
          }]
        }}>
                  <React.Fragment>
                    <TouchableOpacity activeOpacity={0.8} onPress={onPostMoment} style={styles.postCardContainer}>
                      {userAvatar ? <Animated.Image source={{
                uri: userAvatar
              }} style={styles.postCardImage} /> : <View style={[styles.postCardImage, {
                backgroundColor: '#333'
              }]} />}
                      <View style={styles.postCardOverlay}>
                        <View style={styles.iconCircle}>
                          <Image source={require('../../../../../../assets/appicon/appicon.png')} style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8
                  }} contentFit="contain" />
                        </View>
                        <Text style={styles.postCardText}>Add Moment</Text>
                      </View>
                      <Text style={styles.postCardChannel} numberOfLines={1}>{channelName}</Text>
                    </TouchableOpacity>
                  </React.Fragment>
                </Animated.View>;
      }
      return <Animated.View style={{
        transform: [{
          scale
        }]
      }}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => {
          const actualIndex = moments.findIndex(m => m.id === (item as any).id);
          setInitialViewerIndex(actualIndex !== -1 ? actualIndex : 0);
          setViewerVisible(true);
        }}>
                  <PromotionBannerCard moment={item as MomentData} />
                </TouchableOpacity>
              </Animated.View>;
    }} />

      {/* Interactive Status Viewer */}
      <StatusViewer visible={viewerVisible} onClose={() => setViewerVisible(false)} statusGroups={statusGroups} initialGroupIndex={initialViewerIndex} />
    </View>;
};