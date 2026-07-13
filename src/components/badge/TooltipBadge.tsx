import { useStyles } from "@/core/hooks/useStyles";
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
export interface TooltipBadgeProps {
  visible: boolean;
  text: string;
  color?: string;
  width?: number;
  placement?: 'top' | 'bottom' | 'right';
}
export const TooltipBadge: React.FC<TooltipBadgeProps> = ({
  visible,
  text,
  color = '#FF3B30',
  width = 90,
  placement = 'top'
}) => {
  const styles = useStyles(colors => ({
    tooltipContainer: {
      position: 'absolute',
      ...(placement === 'top' && { bottom: '100%', left: '50%', paddingBottom: 4 }),
      ...(placement === 'bottom' && { top: '100%', left: '50%', paddingTop: 4 }),
      ...(placement === 'right' && { left: '100%', top: '50%', paddingLeft: 4 }),
      alignItems: 'center',
      zIndex: 100
    },
    tooltipBubble: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4
    },
    tooltipText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center'
    },
    tooltipArrow: {
      width: 0,
      height: 0,
      ...(placement === 'top' && {
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderBottomWidth: 0,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
      }),
      ...(placement === 'bottom' && {
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 6,
        borderTopWidth: 0,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
      }),
      ...(placement === 'right' && {
        borderTopWidth: 6,
        borderBottomWidth: 6,
        borderRightWidth: 6,
        borderLeftWidth: 0,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
      })
    }
  }));
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    if (visible) {
      Animated.parallel([Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }), Animated.spring(translateY, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: false
      })]).start();
    } else {
      Animated.parallel([Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false
      }), Animated.timing(translateY, {
        toValue: 10,
        duration: 250,
        useNativeDriver: false
      })]).start();
    }
  }, [visible]);
  return <Animated.View style={[styles.tooltipContainer, {
    width,
    transform: [
      ...(placement === 'top' || placement === 'bottom' ? [{ translateX: -(width / 2) }] : []),
      ...(placement === 'right' ? [{ translateY: -15 }] : []), // Center vertically, roughly half of 30px height
      ...(placement === 'top' ? [{ translateY }] : []),
      ...(placement === 'bottom' ? [{ translateY: Animated.multiply(translateY, -1) }] : []),
      ...(placement === 'right' ? [{ translateX: Animated.multiply(translateY, -1) }] : [])
    ],
    opacity,
    pointerEvents: visible ? 'auto' : 'none'
  }]}>
      {placement === 'bottom' && <View style={[styles.tooltipArrow, { borderBottomColor: color }]} />}
      {placement === 'right' && <View style={[styles.tooltipArrow, { borderRightColor: color }]} />}
      
      <View style={[styles.tooltipBubble, { backgroundColor: color }]}>
        <Text style={styles.tooltipText}>{text}</Text>
      </View>
      
      {placement === 'top' && <View style={[styles.tooltipArrow, { borderTopColor: color }]} />}
    </Animated.View>;
};