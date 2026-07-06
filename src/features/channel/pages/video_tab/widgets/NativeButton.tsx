import { useStyles } from "@/core/hooks/useStyles";
import React, { useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet } from 'react-native';
interface NativeButtonProps {
  onTap: () => void;
  text: string;
}
export const NativeButton: React.FC<NativeButtonProps> = ({
  onTap,
  text
}) => {
  const styles = useStyles(colors => ({
    container: {
      paddingHorizontal: 24,
      paddingVertical: 8,
      backgroundColor: colors.background,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)'
    },
    text: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: -0.2
    }
  }));
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20
    }).start();
  };
  return <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onTap}>
      <Animated.View style={[styles.container, {
      transform: [{
        scale
      }]
    }]}>
        <Text style={styles.text}>{text}</Text>
      </Animated.View>
    </Pressable>;
};