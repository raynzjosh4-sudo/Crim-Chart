import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Easing } from 'react-native';
import { GiftBubbleAnimation } from './GiftBubbleAnimation';

// Mock GiftModel to avoid dependency error since we haven't ported it yet
interface GiftModel {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

interface CompetitionGiftButtonProps {
  gift: GiftModel;
  onTap?: () => void;
  onLongPress?: () => void;
  onPlusTap?: () => void;
}

export const CompetitionGiftButton: React.FC<CompetitionGiftButtonProps> = ({
  gift,
  onTap,
  onLongPress,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [bubbles, setBubbles] = useState<{ id: string; x: number; y: number }[]>([]);
  const buttonRef = useRef<View>(null);

  const handleTap = () => {
    // Button scale animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Spawn bubbles (assuming centered on button)
    // For a real app, you'd measure the button's position relative to screen using measureInWindow
    // and use a Portal at the root level. Here we use local coordinates assuming overflow="visible".
    const newBubbles = Array.from({ length: 6 }).map((_, i) => ({
      id: `${Date.now()}_${i}`,
      x: 20, // rough center of 40x40 button
      y: 20,
    }));

    setBubbles(prev => [...prev, ...newBubbles]);

    if (onTap) onTap();
  };

  const removeBubble = useCallback((id: string) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
  }, []);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={1} // custom scale animation handles opacity/feedback
        onPress={handleTap}
        onLongPress={onLongPress}
      >
        <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: gift.imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.text}>Chart</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Render Bubbles */}
      {bubbles.map(bubble => (
        <GiftBubbleAnimation
          key={bubble.id}
          startOffset={{ x: bubble.x, y: bubble.y }}
          imageUrl={gift.imageUrl}
          onComplete={() => removeBubble(bubble.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    // Must allow bubbles to overflow
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
  },
  iconContainer: {
    padding: 6,
    backgroundColor: 'rgba(255, 193, 7, 0.15)', // amber with 0.15 alpha
    borderRadius: 24, // circle
    borderWidth: 1.5,
    borderColor: 'rgba(255, 193, 7, 0.4)',
    shadowColor: 'rgba(255, 193, 7, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: 24,
    height: 24,
  },
  text: {
    marginTop: 6,
    color: '#FFC107', // amber
    fontSize: 10,
    fontWeight: 'bold',
  },
});
