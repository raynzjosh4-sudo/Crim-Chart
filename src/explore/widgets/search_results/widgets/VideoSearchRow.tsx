import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import { GlobalSearchResult } from '../../../models/GlobalSearchResult';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';
import { useAppRouter } from '@/core/hooks/useAppRouter';
import { useDesktopSearchStore } from '@/explore/application/useDesktopSearchStore';

interface Props {
  item: GlobalSearchResult;
}

export const VideoSearchRow: React.FC<Props> = ({ item }) => {
  const styles = useStyles(themeStyles);
  const router = useAppRouter();

  const handlePress = () => {
    const isDesktop = Platform.OS === 'web' && Dimensions.get('window').width >= 768;
    if (isDesktop) {
      useDesktopSearchStore.getState().openResult(item);
      return;
    }
    router.push(`/video-player?id=${item.entity_id}`);
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={handlePress}>
      <View style={styles.avatarContainer}>
        {item.image_url ? (
          <Image source={item.image_url} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.fallbackAvatar}>
            <Play color="#FFF" size={24} />
          </View>
        )}
        <View style={styles.playOverlay}>
          <Play color="#FFF" size={16} fill="#FFF" />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {Boolean(item.subtitle) && <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16 * scale,
    paddingVertical: 10 * scale,
  },
  avatarContainer: {
    width: 48 * scale,
    height: 48 * scale,
    marginRight: 12 * scale,
    position: 'relative' as const,
  },
  avatar: {
    width: '100%' as any,
    height: '100%' as any,
    borderRadius: 8 * scale, 
  },
  fallbackAvatar: {
    width: '100%' as any,
    height: '100%' as any,
    borderRadius: 8 * scale,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8 * scale,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  title: {
    fontSize: 16 * scale,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2 * scale,
  },
  subtitle: {
    fontSize: 13 * scale,
    color: colors.textSecondary,
  },
});
