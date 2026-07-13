import AppAvatar from '@/components/avatar/AppAvatar';
import { GlassShimmer } from '@/components/shimmers/statusViewerShimmer/GlassShimmer';
import { useStyles } from '@/core/hooks/useStyles';
import { saveMediaToDevice } from '@/core/utils/mediaDownload';
import { useMediaViewTracker } from '@/hooks/useMediaViewTracker';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ChevronLeft, ChevronRight, MoreHorizontal, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, Modal, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AudioStatusOverlay } from './AudioStatusOverlay';
import { StatusProgressBar } from './StatusProgressBar';

// --- StatusVideo Component ---
const StatusVideo = ({ url, isPaused, onLoad, isPlaying, contentFit = 'cover' }: { url: string, isPaused: boolean, onLoad: (dur: number) => void, isPlaying: boolean, contentFit?: 'cover' | 'contain' }) => {
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
      style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]}
      player={player}
      contentFit={contentFit}
      nativeControls={false}
    />
  );
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

import { BlockUserDialog } from '@/components/chartdialog/BlockUserDialog';
import { ChartOptionsDialog } from '@/components/chartdialog/ChartOptionsDialog';
import { useBlockUser } from '@/features/profile/hooks/useBlockUser';

// Extended type to support multiple media items
export type MediaItem = {
  id: string;
  url: string;
  type: 'image' | 'video';
  isAudio?: boolean;
  caption?: string;
  thumbnail?: string;
  title?: string;
  artist?: string;
  lyrics?: string;
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

  const [pendingBlockUserId, setPendingBlockUserId] = useState<string | null>(null);
  const { blockUser } = useBlockUser();

  const executeBlockUser = async () => {
    if (pendingBlockUserId) {
      const success = await blockUser(
        pendingBlockUserId,
        statusGroups[groupIndex]?.channelName,
        statusGroups[groupIndex]?.avatarUrl
      );
      if (success) {
        setPendingBlockUserId(null);
        onClose(); // Close the viewer since the user is blocked
      }
    }
  };

  const styles = useStyles(colors => ({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    overlayDesktop: {
      backgroundColor: 'transparent',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background === '#FFFFFF' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
    },
    rightArrow: {
      position: 'absolute',
      right: 24,
      top: '50%',
      marginTop: -24,
      zIndex: 30,
    },
    leftArrow: {
      position: 'absolute',
      left: 24,
      top: '50%',
      marginTop: -24,
      zIndex: 30,
    },
    arrowCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    desktopActionButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      borderRadius: Platform.OS === 'ios' ? 16 : 0,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },
    topGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 150,
      zIndex: 10,
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
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    counter: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    iconButton: {
      padding: 8,
    },
    captionContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 60,
      zIndex: 10,
      justifyContent: 'flex-end',
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
  }));

  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const viewerWidth = isDesktop ? Math.min(width * 0.85, 1200) : width;
  const viewerHeight = isDesktop ? Math.min(height * 0.85, 900) : height;

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
  if (!isLoadingData && statusGroups.length === 0) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={[styles.overlay, isDesktop && styles.overlayDesktop]}>
          {isDesktop && <TouchableWithoutFeedback onPress={onClose}><View style={styles.backdrop} /></TouchableWithoutFeedback>}
          <View style={[styles.container, isDesktop && { width: viewerWidth, height: viewerHeight, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#FFF', fontSize: 18 }}>No active statuses available.</Text>
            <TouchableOpacity style={{ marginTop: 20 }} onPress={onClose}>
              <Text style={{ color: '#007AFF', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

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
    if (x < viewerWidth * 0.3) {
      goBack();
    } else {
      goNext();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, isDesktop && styles.overlayDesktop]}>
        {isDesktop && <TouchableWithoutFeedback onPress={onClose}><View style={styles.backdrop} /></TouchableWithoutFeedback>}

        <View style={isDesktop ? { flexDirection: 'row', alignItems: 'flex-start' } : { flex: 1, width: '100%' }}>
          {/* @ts-ignore - React 19 typing conflict with RNGH */}
          <GestureHandlerRootView style={[!isDesktop && { flex: 1, backgroundColor: 'transparent', width: '100%' }, isDesktop && { display: 'flex', width: viewerWidth, height: viewerHeight, borderRadius: 24, overflow: 'hidden' }]}>
            {(() => {
              const innerContent = (
                <Animated.View style={[styles.container, animatedStyle, isDesktop && { borderRadius: 24, overflow: 'hidden' }]}>
                  <View style={[styles.content, isDesktop && { borderRadius: 24 }]}>

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
                          <>
                            <ExpoImage
                              source={{ uri: currentMedia.url }}
                              style={StyleSheet.absoluteFillObject}
                              contentFit="cover"
                              blurRadius={40}
                            />
                            <ExpoImage
                              source={{ uri: currentMedia.url }}
                              style={StyleSheet.absoluteFillObject}
                              contentFit="contain"
                              onLoadStart={() => setIsMediaLoaded(false)}
                              onLoad={() => setIsMediaLoaded(true)}
                            />
                          </>
                        ) : currentMedia?.type === 'video' ? (
                          <>
                            {/* For audio statuses, keep the blurred thumbnail background persistent */}
                            {/* On desktop, video is contained, so we also show the blurred background */}
                            {(!isMediaLoaded || currentMedia.isAudio || isDesktop) && currentMedia.thumbnail && (
                              <ExpoImage
                                source={{ uri: currentMedia.thumbnail }}
                                style={StyleSheet.absoluteFillObject}
                                contentFit="cover"
                                blurRadius={currentMedia.isAudio ? 20 : 40}
                              />
                            )}

                            {/* The video player will play both video and audio. For audio, it will be invisible. */}
                            <View style={currentMedia.isAudio ? { width: 1, height: 1, opacity: 0, position: 'absolute' } : [StyleSheet.absoluteFillObject, { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }]}>
                              <StatusVideo
                                url={currentMedia.url}
                                isPaused={isPaused || showOptions}
                                isPlaying={true}
                                contentFit={isDesktop ? 'contain' : 'cover'}
                                onLoad={(dur) => {
                                  if (dur && !isNaN(dur)) setMediaDuration(dur);
                                  setIsMediaLoaded(true);
                                }}
                              />
                            </View>

                            {/* Render Audio Widget on top if it is an audio status */}
                            {currentMedia.isAudio && (
                              <AudioStatusOverlay
                                title={currentMedia.title}
                                artist={currentMedia.artist}
                                lyrics={currentMedia.lyrics}
                                thumbnail={currentMedia.thumbnail}
                              />
                            )}
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
                              onLoad={() => { }}
                            />
                          </View>
                        )}
                      </View>
                    </TouchableWithoutFeedback>

                    {/* Gradient Overlay for Header */}
                    {(!isLoadingData || statusGroups.length > 0) && (
                      <LinearGradient
                        colors={['rgba(0,0,0,0.7)', 'transparent']}
                        style={styles.topGradient}
                      />
                    )}

                    {/* UI Layer */}
                    {(!isLoadingData || statusGroups.length > 0) && (
                      <View style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || insets.top) + 16 : Math.max(insets.top, 16) }]}>
                        {currentGroup && (
                          <>
                            <StatusProgressBar
                              count={currentGroup.media.length}
                              currentIndex={mediaIndex}
                              duration={mediaDuration}
                              isPaused={isPaused || showOptions || !!pendingBlockUserId || !isMediaLoaded}
                              onComplete={goNext}
                            />

                            <View style={styles.header}>
                              <AppAvatar imageUrl={currentGroup.avatarUrl} size={40} />
                              <View style={styles.headerTextContainer}>
                                <Text style={styles.username}>{currentGroup.channelName}</Text>
                                <Text style={styles.counter}>{`${mediaIndex + 1} of ${currentGroup.media.length}`}</Text>
                              </View>
                              {!isDesktop && (
                                <>
                                  <TouchableWithoutFeedback onPress={() => setShowOptions(true)}>
                                    <View style={styles.iconButton}>
                                      <MoreHorizontal color={styles.username.color as string} size={24} />
                                    </View>
                                  </TouchableWithoutFeedback>
                                  <TouchableWithoutFeedback onPress={onClose}>
                                    <View style={styles.iconButton}>
                                      <X color={styles.username.color as string} size={24} />
                                    </View>
                                  </TouchableWithoutFeedback>
                                </>
                              )}
                            </View>
                          </>
                        )}
                      </View>
                    )}

                    {/* Caption Layer */}
                    {!!currentMedia?.caption && (
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.captionContainer}
                      >
                        <Text style={styles.captionText}>{currentMedia.caption}</Text>
                      </LinearGradient>
                    )}

                    {/* Navigation Arrows */}
                    {isDesktop && (
                      <>
                        {(mediaIndex > 0 || groupIndex > 0) && (
                          <TouchableWithoutFeedback onPress={goBack}>
                            <View style={styles.leftArrow}>
                              <View style={styles.arrowCircle}>
                                <ChevronLeft color={styles.username.color as string} size={32} />
                              </View>
                            </View>
                          </TouchableWithoutFeedback>
                        )}
                        {(mediaIndex < currentGroup?.media?.length - 1 || groupIndex < statusGroups.length - 1) && (
                          <TouchableWithoutFeedback onPress={goNext}>
                            <View style={styles.rightArrow}>
                              <View style={styles.arrowCircle}>
                                <ChevronRight color={styles.username.color as string} size={32} />
                              </View>
                            </View>
                          </TouchableWithoutFeedback>
                        )}
                      </>
                    )}

                  </View>
                </Animated.View>
              );

              if (isDesktop) {
                return innerContent;
              }
              return (
                <GestureDetector gesture={panGesture}>
                  {innerContent}
                </GestureDetector>
              );
            })()}
          </GestureHandlerRootView>

          {isDesktop && (
            <View style={{ marginLeft: 24, marginTop: 16 }}>
              <TouchableOpacity style={styles.desktopActionButton} onPress={() => setShowOptions(true)} activeOpacity={0.7}>
                <MoreHorizontal color="#FFF" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.desktopActionButton, { marginTop: 16 }]} onPress={onClose} activeOpacity={0.7}>
                <X color="#FFF" size={24} />
              </TouchableOpacity>
            </View>
          )}
        </View>

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
            onSaveTap={currentMedia?.url ? () => {
              saveMediaToDevice(currentMedia.url, currentMedia.isAudio);
              setShowOptions(false);
            } : undefined}
            targetUserId={currentGroup.id}
            onBlockUserTap={(userId) => {
              setShowOptions(false);
              setPendingBlockUserId(userId);
            }}
          />
        )}

        <BlockUserDialog
          visible={!!pendingBlockUserId}
          username={currentGroup?.channelName || ''}
          onCancel={() => setPendingBlockUserId(null)}
          onConfirm={executeBlockUser}
        />
      </View>
    </Modal>
  );
};

