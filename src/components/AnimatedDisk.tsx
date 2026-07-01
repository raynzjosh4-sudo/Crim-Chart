import React, { useRef, useEffect, useState } from 'react';
import { Animated, TouchableOpacity, StyleSheet, View, Easing, Text } from 'react-native';
import { Image } from 'expo-image';
import { Pause, Play } from 'lucide-react-native';

export interface AnimatedDiskProps {
  imageUrl?: string;
  size?: number;
  isPlaying: boolean;
  onPress: () => void;
  showOverlayIcons?: boolean;
  placeholderText?: string;
}

export const AnimatedDisk: React.FC<AnimatedDiskProps> = ({ 
  imageUrl, 
  size = 180, 
  isPlaying, 
  onPress,
  showOverlayIcons = true,
  placeholderText = "Add Image"
}) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const [rotationDirection, setRotationDirection] = useState<number>(1);
  const currentRotation = useRef(0);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Reset error state whenever the image URL changes (new song selected)
  useEffect(() => {
    setImageLoadError(false);
  }, [imageUrl]);

  useEffect(() => {
    // Keep track of the current value so we can resume from it
    const listener = rotation.addListener(({ value }) => {
      currentRotation.current = value;
    });

    if (isPlaying) {
      startRotation();
    } else {
      stopRotation();
    }

    return () => {
      rotation.removeListener(listener);
    };
  }, [isPlaying, rotationDirection]);

  const startRotation = () => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: rotationDirection === 1 ? 1 : 0,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRotation = () => {
    rotation.stopAnimation();
  };

  const handlePress = () => {
    if (isPlaying) {
      // Reversing the playing way / direction on tap when playing
      setRotationDirection(rotationDirection === 1 ? 0 : 1);
      // Reset rotation value slightly to keep infinite loop smooth if needed
      // Actually simply toggling direction will handle the reverse play
    }
    onPress();
  };

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const centerHoleSize = size * 0.16;

  return (
    <TouchableOpacity 
      style={[
        styles.diskContainer, 
        { width: size, height: size, borderRadius: size / 2 }
      ]} 
      onPress={handlePress} 
      activeOpacity={0.8}
    >
      <Animated.View style={[
        styles.diskWrapper, 
        { width: size, height: size, borderRadius: size / 2, transform: [{ rotate: spin }] }
      ]}>
        {imageUrl && !imageLoadError ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
            contentFit="cover"
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <View style={[styles.placeholder, { borderRadius: size / 2 }]}>
            <Text style={styles.placeholderText}>{placeholderText}</Text>
          </View>
        )}
        
        {/* The center hole of the disk */}
        <View style={[styles.centerHole, { 
          width: centerHoleSize, 
          height: centerHoleSize, 
          marginTop: -centerHoleSize / 2, 
          marginLeft: -centerHoleSize / 2, 
          borderRadius: centerHoleSize / 2 
        }]} />
      </Animated.View>

      {/* Overlay Icons (Play/Pause) */}
      {showOverlayIcons && (
        <View style={[styles.playOverlay, { width: size * 0.35, height: size * 0.35, borderRadius: size * 0.175 }]}>
          {isPlaying ? (
            <Pause size={size * 0.15} color="#FFF" fill="#FFF" />
          ) : (
            <Play size={size * 0.15} color="#FFF" fill="#FFF" style={{ marginLeft: 3 }} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  diskContainer: {
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  diskWrapper: {
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '600',
    position: 'absolute',
    top: '25%',
  },
  centerHole: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#333',
  },
  playOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  }
});
