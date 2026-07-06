import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/core/theme/colors';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
interface BrowserSpinnerProps {
  isVisible: boolean;
}
export const BrowserSpinner = ({
  isVisible
}: BrowserSpinnerProps) => {
  const styles = useStyles(colors => ({
    container: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 9999,
      alignItems: 'center',
      paddingTop: 16
    },
    spinnerWrapper: {
      backgroundColor: '#202327',
      padding: 10,
      borderRadius: 24,
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5
    }
  }));
  if (!isVisible) return null;
  return <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.container} pointerEvents="none">
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    </Animated.View>;
};