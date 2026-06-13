import AppAvatar from '@/components/avatar/AppAvatar';
import { Image as ExpoImage } from 'expo-image';
import { MoreHorizontal, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableWithoutFeedback, View, StatusBar, ActivityIndicator } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusProgressBar } from './StatusProgressBar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { GlassShimmer } from '@/components/shimmers/statusViewerShimmer/GlassShimmer';
import { useMediaViewTracker } from '@/hooks/useMediaViewTracker';

// --- StatusVideo Component ---
const StatusVideo = ({ url, isPaused, onLoad, isPlaying }: { url: string, isPaused: boolean, onLoad: (dur: number) => void, isPlaying: boolean }) => {
  const player = useVideoPlayer(url, player => {
    player.loop = false;
  });

  useEffect(() => {
    if (isPlaying && !isPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying, isPaused, player]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (player.status === 'readyToPlay') {
        const dur = player.duration;
        onLoad(dur ? dur * 1000 : 5000);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [player, onLoad]);

  return (
    <VideoView
      style={StyleSheet.absoluteFillObject}
      player={player}
      contentFit="contain"
      nativeControls={false}
    />
  );
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

import { ChartOptionsDialog } from '@/components/chartdialog/ChartOptionsDialog';

// Extended type to support multiple media items
export type MediaItem = {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  thumbnail?: string;
};

export type StatusGroup = {
  id: string;
  channelName: string;
  avatarUrl: string;
  media: MediaItem[];
};

interface StatusViewerProps {
  visible: boolean;
  onClose: () => void;
  statusGroups: StatusGroup[];
  initialGroupIndex?: number;
  isLoadingData?: boolean;
  skeletonUser?: { name: string; avatar: string };
}

export const StatusViewer: React.FC<StatusViewerProps> = ({
  visible,
  onClose,
  statusGroups,
  initialGroupIndex = 0,
  isLoadingData = false,
  skeletonUser,
}) => {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [mediaDuration, setMediaDuration] = useState(5000);
  const insets = useSafeAreaInsets();

  // Reset state when visible changes
  useEffect(() => {
    if (visible) {
      setGroupIndex(initialGroupIndex);
      setMediaIndex(0);
      setIsPaused(false);
      setShowOptions(false);
      setIsMediaLoaded(false);
      translateY.value = 0;
      scale.value = 1;
    }
  }, [visible, initialGroupIndex]);

  useEffect(() => {
    setIsMediaLoaded(false);
    setMediaDuration(5000);
  }, [groupIndex, mediaIndex]);

  // Gestures for swipe down to close
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleClose = () => {
    onClose();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        scale.value = interpolate(event.translationY, [0, SCREEN_HEIGHT], [1, 0.8]);
      }
    })
    .onEnd((event) => {
      if (event.translationY > SCREEN_HEIGHT * 0.2 || event.velocityY > 1000) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const currentGroup = statusGroups[groupIndex];
  const currentMedia = currentGroup?.media?.[mediaIndex];

  // Track the view automatically
  useMediaViewTracker({
    mediaId: visible ? currentMedia?.id : undefined,
    tableName: 'status_views',
    idColumn: 'status_id',
    authorId: currentGroup?.id,
  });

  if (!visible) return null;
  if (!isLoadingData && statusGroups.length === 0) return null;

  const nextMedia = currentGroup?.media?.[mediaIndex + 1];

  const goNext = () => {
    if (showOptions) return; // Don't advance if options are open
    if (mediaIndex < currentGroup.media.length - 1) {
      setMediaIndex(mediaIndex + 1);
    } else if (groupIndex < statusGroups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setMediaIndex(0);
    } else {
      onClose();
    }
  };

  const goBack = () => {
    if (showOptions) return; // Don't advance if options are open
    if (mediaIndex > 0) {
      setMediaIndex(mediaIndex - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
      setMediaIndex(statusGroups[groupIndex - 1].media.length - 1);
    } else {
      // At the very beginning, just restart the first media
      setMediaIndex(0);
    }
  };

  const handlePress = (e: any) => {
    if (showOptions) return;
    const x = e.nativeEvent.locationX;
    if (x < SCREEN_WIDTH * 0.3) {
      goBack();
    } else {
      goNext();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* @ts-ignore - React 19 typing conflict with RNGH */}
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.content}>

              {/* Media Layer */}
              <TouchableWithoutFeedback
                onPress={handlePress}
                onPressIn={() => setIsPaused(true)}
                onPressOut={() => setIsPaused(false)}
              >
                <View style={StyleSheet.absoluteFillObject}>
                  {isLoadingData && statusGroups.length === 0 ? (
                    <GlassShimmer skeletonUser={skeletonUser} />
                  ) : currentMedia?.type === 'image' ? (
                    <ExpoImage
                      source={{ uri: currentMedia.url }}
                      style={StyleSheet.absoluteFillObject}
                      contentFit="contain"
                      onLoadStart={() => setIsMediaLoaded(false)}
                      onLoad={() => setIsMediaLoaded(true)}
                    />
                  ) : currentMedia?.type === 'video' ? (
                    <>
                      {!isMediaLoaded && currentMedia.thumbnail && (
                        <ExpoImage
                          source={{ uri: currentMedia.thumbnail }}
                          style={StyleSheet.absoluteFillObject}
                          contentFit="contain"
                          blurRadius={10}
                        />
                      )}
                      <StatusVideo 
                        url={currentMedia.url} 
                        isPaused={isPaused || showOptions} 
                        isPlaying={true}
                        onLoad={(dur) => {
                          if (dur && !isNaN(dur)) setMediaDuration(dur);
                          setIsMediaLoaded(true);
                        }} 
                      />
                    </>
                  ) : null}

                  {/* Prefetch Next Media */}
                  {nextMedia?.type === 'image' && (
                    <ExpoImage
                      source={{ uri: nextMedia.url }}
                      style={{ width: 1, height: 1, opacity: 0, position: 'absolute' }}
                      contentFit="contain"
                    />
                  )}
                  {nextMedia?.type === 'video' && (
                     <View style={{ width: 1, height: 1, opacity: 0, position: 'absolute' }}>
                       <StatusVideo 
                         url={nextMedia.url} 
                         isPaused={true} 
                         isPlaying={false}
                         onLoad={() => {}} 
                       />
                     </View>
                  )}
                </View>
              </TouchableWithoutFeedback>

              {/* Gradient Overlay for Header */}
              {(!isLoadingData || statusGroups.length > 0) && <View style={styles.topGradient} />}

              {/* UI Layer */}
              {(!isLoadingData || statusGroups.length > 0) && (
                <View style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || insets.top) + 16 : Math.max(insets.top, 16) }]}>
                  {currentGroup && (
                    <>
                      <StatusProgressBar
                        count={currentGroup.media.length}
                        currentIndex={mediaIndex}
                        duration={mediaDuration}
                        isPaused={isPaused || showOptions || !isMediaLoaded}
                        onComplete={goNext}
                      />

                    <View style={styles.header}>
                      <AppAvatar imageUrl={currentGroup.avatarUrl} size={40} />
                      <View style={styles.headerTextContainer}>
                        <Text style={styles.username}>{currentGroup.channelName}</Text>
                        <Text style={styles.counter}>{`${mediaIndex + 1} of ${currentGroup.media.length}`}</Text>
                      </View>
                      <TouchableWithoutFeedback onPress={() => setShowOptions(true)}>
                        <View style={styles.iconButton}>
                          <MoreHorizontal color="#FFF" size={24} />
                        </View>
                      </TouchableWithoutFeedback>
                      <TouchableWithoutFeedback onPress={onClose}>
                        <View style={styles.iconButton}>
                          <X color="#FFF" size={24} />
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  </>
                )}
              </View>
              )}

              {/* Caption Layer */}
              {currentMedia?.caption && (
                <View style={styles.captionContainer}>
                  <Text style={styles.captionText}>{currentMedia.caption}</Text>
                </View>
              )}

            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>

      {currentGroup && (
        <ChartOptionsDialog
          visible={showOptions}
          onClose={() => setShowOptions(false)}
          username={currentGroup.channelName}
          userProfileImageUrl={currentGroup.avatarUrl}
          statusImageUrl={currentMedia?.url}
          isChartable={true}
          themeColor="#FFB800"
          onChartTap={() => { }}
          onProfileTap={() => { }}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    borderRadius: Platform.OS === 'ios' ? 16 : 0,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.3)', // Simulating a simple gradient
  },
  safeArea: {
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 24,
    zIndex: 20,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  counter: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  iconButton: {
    padding: 8,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', // Simulated bottom gradient
  },
  captionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
