import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Radio } from 'lucide-react-native';
import { GlobalSearchResult } from '../../../models/GlobalSearchResult';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';
import { useAppRouter } from '@/core/hooks/useAppRouter';
import { Platform, Dimensions } from 'react-native';
import { useDesktopSearchStore } from '@/explore/application/useDesktopSearchStore';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';

interface Props {
  item: GlobalSearchResult;
}

export const ChannelSearchRow: React.FC<Props> = ({ item }) => {
  const styles = useStyles(themeStyles);
  const router = useAppRouter();
  const { startLoading } = useGlobalProgress();

  const handlePress = () => {
    const isDesktop = Platform.OS === 'web' && Dimensions.get('window').width >= 768;
    if (isDesktop) {
      useDesktopSearchStore.getState().openResult(item);
    } else {
      startLoading();
      setTimeout(() => {
        router.push({ pathname: '/channel/channelpage', params: { id: item.entity_id } } as any);
      }, 100);
    }
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={handlePress}>
      <View style={styles.avatarContainer}>
        {item.image_url ? (
          <Image source={item.image_url} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.fallbackAvatar}>
            <Radio color="#FFF" size={24} />
          </View>
        )}
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
  },
  avatar: {
    width: '100%' as any,
    height: '100%' as any,
    borderRadius: 24 * scale,
  },
  fallbackAvatar: {
    width: '100%' as any,
    height: '100%' as any,
    borderRadius: 24 * scale,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  title: {
    fontSize: 16 * scale,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2 * scale,
  },
  subtitle: {
    fontSize: 13 * scale,
    color: colors.textSecondary,
  },
});
