import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export interface TooltipBadgeProps {
  visible: boolean;
  text: string;
  color?: string;
  width?: number;
}

export const TooltipBadge: React.FC<TooltipBadgeProps> = ({ 
  visible, 
  text, 
  color = '#FF3B30',
  width = 90
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 10,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View 
      style={[
        styles.tooltipContainer, 
        { 
          width, 
          transform: [{ translateX: -(width / 2) }, { translateY }],
          opacity,
          pointerEvents: visible ? 'auto' : 'none',
        }
      ]}
    >
      <View style={[styles.tooltipBubble, { backgroundColor: color }]}>
        <Text style={styles.tooltipText}>{text}</Text>
      </View>
      <View style={[styles.tooltipArrow, { borderTopColor: color }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    alignItems: 'center',
    paddingBottom: 4,
    zIndex: 100,
  },
  tooltipBubble: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
