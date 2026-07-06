import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Play } from 'lucide-react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

const { width } = Dimensions.get('window');
const VIDEO_WIDTH = (width - 48) / 2; // 16 padding on each side, 16 gap between = 48
const VIDEO_HEIGHT = VIDEO_WIDTH * (16 / 9);

const DUMMY_SHORTS = [
  {
    id: '1',
    title: 'Craziest trick shot you will ever see! 🏀🔥',
    views: '1.2M views',
    thumbnail: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Behind the scenes at the studio 🎤',
    views: '450K views',
    thumbnail: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=400&auto=format&fit=crop'
  }
];

export const ShortVideosWidget = () => {
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Shorts For You</Text>
      <View style={styles.grid}>
        {DUMMY_SHORTS.map((short) => (
          <TouchableOpacity activeOpacity={0.8} key={short.id} style={styles.videoCard}>
            <Image source={{ uri: short.thumbnail }} style={styles.thumbnail} />
            <View style={styles.overlay}>
              <View style={styles.playIconContainer}>
                <Play size={20} color={theme.colors.onPrimary} fill={theme.colors.onPrimary} style={{ marginLeft: 2 }} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={2}>{short.title}</Text>
                <Text style={styles.views}>{short.views}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const themeStyles = (colors: ThemeTokens) => StyleSheet.create({
  container: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  videoCard: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
    padding: 12,
  },
  playIconContainer: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginTop: 'auto',
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  views: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
