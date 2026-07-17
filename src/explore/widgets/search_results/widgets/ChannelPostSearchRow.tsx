import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { MessageSquare, Music, Play } from 'lucide-react-native';
import { GlobalSearchResult } from '../../../models/GlobalSearchResult';
import { useStyles } from '@/core/hooks/useStyles';
import { useAppRouter } from '@/core/hooks/useAppRouter';
import { useDesktopSearchStore } from '@/explore/application/useDesktopSearchStore';
import { ThemeTokens } from '@/core/theme/themes';
import { useTranslation } from 'react-i18next';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';

interface Props {
  item: GlobalSearchResult;
}

export const ChannelPostSearchRow: React.FC<Props> = ({ item }) => {
  const styles = useStyles(themeStyles);
  const { t } = useTranslation();
  const router = useAppRouter();
  const { startLoading } = useGlobalProgress();

  const handlePress = () => {
    const isDesktop = Platform.OS === 'web' && Dimensions.get('window').width >= 768;
    if (isDesktop) {
      useDesktopSearchStore.getState().openResult(item);
    } else {
      startLoading();
      setTimeout(() => {
        router.push(`/channel/post/${item.entity_id}?type=${item.entity_type}`);
      }, 100);
    }
  };

  const getFallbackIcon = () => {
    if (item.entity_type === 'channel_music') return <Music color="#FFF" size={24} />;
    if (item.entity_type === 'channel_video') return <Play color="#FFF" size={24} />;
    return <MessageSquare color="#FFF" size={24} />;
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={handlePress}>
      <View style={styles.avatarContainer}>
        {item.image_url ? (
          <Image source={item.image_url} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.fallbackAvatar}>
            {getFallbackIcon()}
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{item.title || 'Post'}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {t('in_channel', { channel: item.subtitle || 'channel' })}
        </Text>
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
    color: colors.primary, // Make channel name pop
  },
});
