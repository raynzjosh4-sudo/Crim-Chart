import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Animated, TouchableWithoutFeedback } from 'react-native';
import { Image } from 'expo-image';
import { MoreHorizontal, X } from 'lucide-react-native';
import AppAvatar from '@/components/avatar/AppAvatar';


export interface ChannelStatusEntity {
  author: {
    displayName: string;
    profileImageUrl?: string;
  };
  imageUrls: string[];
  isVideo: boolean;
  videoUrl?: string;
  caption?: string;
}

interface StatusPageProps {
  status?: ChannelStatusEntity;
  username?: string;
  userProfileImageUrl?: string;
  statusImageUrl?: string;
  isChartable?: boolean;
  isPublic?: boolean;
  heroTag?: string;
  onClose: () => void;
  onOptionsTap: (currentIndex: number) => void;
  onProfileTap: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const StatusPage: React.FC<StatusPageProps> = ({
  status,
  username,
  userProfileImageUrl,
  statusImageUrl,
  isChartable = true,
  isPublic = true,
  heroTag,
  onClose,
  onOptionsTap,
  onProfileTap,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const isPaused = useRef(false);

  const mediaList = status?.imageUrls?.length ? status.imageUrls : [statusImageUrl || ''];
  const totalMedia = mediaList.length;

  useEffect(() => {
    startAnimation();
    return () => progressAnim.stopAnimation();
  }, [currentIndex]);

  const startAnimation = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused.current) {
        handleNext();
      }
    });
  };

  const handleNext = () => {
    if (currentIndex < totalMedia - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      startAnimation();
    }
  };

  const handleTap = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    if (x < screenWidth / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handleLongPress = () => {
    isPaused.current = true;
    progressAnim.stopAnimation();
  };

  const handlePressOut = () => {
    isPaused.current = false;
    // Resume animation from current value
    progressAnim.addListener(({ value }) => {
      progressAnim.removeAllListeners();
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000 * (1 - value),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && !isPaused.current) handleNext();
      });
    });
  };

  const currentImageUrl = mediaList[currentIndex];
  const displayUsername = status?.author?.displayName || username || '-';
  const displayProfileImage = status?.author?.profileImageUrl || userProfileImageUrl || '';
  const isVideo = status?.isVideo || false;
  const videoUrl = status?.videoUrl;
  const caption = status?.caption;

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={handleTap}
        onLongPress={handleLongPress}
        onPressOut={handlePressOut}
      >
        <View style={StyleSheet.absoluteFill}>
          {isVideo && videoUrl ? (
            <View />
          ) : (
            <Image
              source={{ uri: currentImageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          )}

          {/* Top Gradient */}
          <View style={styles.topGradient} />

          <SafeAreaView style={styles.safeArea}>
            <View style={styles.progressContainer}>
              {mediaList.map((_, index) => {
                let progressWidth = '0%';
                if (index < currentIndex) progressWidth = '100%';
                
                return (
                  <View key={index} style={styles.progressBarTrack}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          width: (index === currentIndex
                            ? progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                            : progressWidth) as any
                        }
                      ]}
                    />
                  </View>
                );
              })}
            </View>

            <View style={styles.headerRow}>
              <AppAvatar
                size={40}
                imageUrl={displayProfileImage}
                showStatusRing={false}
                showActiveDot={false}
                onImageTap={onProfileTap}
              />
              <View style={styles.userInfo}>
                <Text style={styles.username}>{displayUsername}</Text>
                <Text style={styles.counterText}>{currentIndex + 1} of {totalMedia}</Text>
              </View>
              <TouchableOpacity activeOpacity={1} onPress={() => onOptionsTap(currentIndex)} style={styles.iconButton}>
                <MoreHorizontal color="white" size={28} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.iconButton}>
                <X color="white" size={28} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Caption Layer (Truncated part reconstructed) */}
          {!!caption && (
            <View style={styles.captionContainer}>
              <Text style={styles.captionText}>{caption}</Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Simplified gradient alternative
  },
  safeArea: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    marginHorizontal: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  counterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  iconButton: {
    marginLeft: 10,
    padding: 4,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', // Simplified gradient alternative
  },
  captionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

