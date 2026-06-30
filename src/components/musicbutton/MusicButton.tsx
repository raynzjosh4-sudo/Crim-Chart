import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Music } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { TrendingBadge } from './TrendingBadge';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useMusicFeedStore } from '@/core/store/useMusicFeedStore';

export const MusicButton = () => {
  const router = useRouter();
  const theme = useCurrentTheme();
  const { startLoading, stopLoading } = useGlobalProgress();

  const handlePress = async () => {
    startLoading();
    try {
      await useMusicFeedStore.getState().prefetch();
    } catch (e) {}
    router.push('/my-music');
  };

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      onPress={handlePress} 
      style={[styles.container, { position: 'relative', zIndex: 10 }]}
    >
      <Music color={theme.colors.primary} size={24} />
      <TrendingBadge />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  }
});
