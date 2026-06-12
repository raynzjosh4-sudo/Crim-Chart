import AppAvatar from '@/components/avatar/AppAvatar';
import { Image as ExpoImage } from 'expo-image';
import { MoreHorizontal, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StatusProgressBar } from './StatusProgressBar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

import { ChartOptionsDialog } from '@/components/chartdialog/ChartOptionsDialog';

// Extended type to support multiple media items
export type MediaItem = {
  url: string;
  type: 'image' | 'video';
  caption?: string;
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
}

export const StatusViewer: React.FC<StatusViewerProps> = ({
  visible,
  onClose,
  statusGroups,
  initialGroupIndex = 0,
}) => {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Reset state when visible changes
  useEffect(() => {
    if (visible) {
      setGroupIndex(initialGroupIndex);
      setMediaIndex(0);
      setIsPaused(false);
      setShowOptions(false);
      translateY.value = 0;
      scale.value = 1;
    }
  }, [visible, initialGroupIndex]);

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

  if (!visible || statusGroups.length === 0) return null;

  const currentGroup = statusGroups[groupIndex];
  if (!currentGroup) return null;

  const currentMedia = currentGroup.media[mediaIndex];

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
                  {currentMedia?.type === 'image' && (
                    <ExpoImage
                      source={{ uri: currentMedia.url }}
                      style={StyleSheet.absoluteFillObject}
                      contentFit="cover"
                    />
                  )}
                  {/* TODO: Add expo-video support here if type === 'video' */}
                </View>
              </TouchableWithoutFeedback>

              {/* Gradient Overlay for Header */}
              <View style={styles.topGradient} />

              {/* UI Layer */}
              <SafeAreaView style={styles.safeArea}>
                <StatusProgressBar
                  count={currentGroup.media.length}
                  currentIndex={mediaIndex}
                  isPaused={isPaused || showOptions}
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
              </SafeAreaView>

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
    paddingTop: Platform.OS === 'android' ? 24 : 0,
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
