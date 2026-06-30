import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useCurrentTheme } from '@/core/store/useThemeStore';

export const TrendingBadge = () => {
  const theme = useCurrentTheme();
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBadge(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!showBadge) return null;

  return (
    <View style={styles.igBadgeContainer}>
      <View style={[styles.igBadgeTriangle, { borderBottomColor: theme.colors.error }]} />
      <View style={[styles.igBadgeBubble, { backgroundColor: theme.colors.error }]}>
        <Flame color="#FFF" size={10} />
        <Text style={[styles.igBadgeText, { marginLeft: 4 }]}>
          1 trending song
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  igBadgeContainer: {
    position: 'absolute',
    top: 35,
    right: -10, // Extend past the button edge slightly
    alignItems: 'flex-end',
    zIndex: 100,
    elevation: 20, // Ensure it floats on Android
  },
  igBadgeTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -1,
    marginRight: 24, // Distance from the right edge to center under the icon
  },
  igBadgeBubble: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  },
  igBadgeText: { 
    color: '#FFF', 
    fontSize: 11, 
    fontWeight: '700' 
  }
});
