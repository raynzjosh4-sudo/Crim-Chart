import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Music, Play, ShoppingBag, Trophy, FolderHeart, Box } from 'lucide-react-native';
import { GlobalSearchResult } from '../../../models/GlobalSearchResult';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';
import { useAppRouter } from '@/core/hooks/useAppRouter';
import { useTranslation } from 'react-i18next';
import { useDesktopBoxStore } from '@/features/boxes/application/useDesktopBoxStore';


interface Props {
  item: GlobalSearchResult;
}

export const BoxSearchRow: React.FC<Props> = ({ item }) => {
  const styles = useStyles(themeStyles);
  const router = useAppRouter();
  const { t } = useTranslation();

  const handlePress = () => {
    const isDesktop = Platform.OS === 'web' && Dimensions.get('window').width >= 768;
    if (isDesktop) {
      useDesktopBoxStore.getState().openBox(item.entity_id, item.entity_type);
    } else {
      switch (item.entity_type) {
        case 'box_music': router.push(`/music-box/${item.entity_id}`); break;
        case 'box_movie': router.push(`/movie-box/${item.entity_id}`); break;
        case 'box_store': router.push(`/store-box/${item.entity_id}`); break;
        case 'box_sports': router.push(`/sports-box/${item.entity_id}`); break;
        case 'box_voting': router.push(`/voting-box/${item.entity_id}`); break;
      }
    }
  };

  const getBoxConfig = () => {
    switch(item.entity_type) {
      case 'box_music': return { icon: <Music color="#FFF" size={24} />, label: t('music_box'), color: '#3B82F6' };
      case 'box_movie': return { icon: <Play color="#FFF" size={24} />, label: t('movie_box'), color: '#EF4444' };
      case 'box_store': return { icon: <ShoppingBag color="#FFF" size={24} />, label: t('store_box'), color: '#10B981' };
      case 'box_sports': return { icon: <FolderHeart color="#FFF" size={24} />, label: t('sports_box'), color: '#F59E0B' };
      case 'box_voting': return { icon: <Trophy color="#FFF" size={24} />, label: t('voting_box'), color: '#8B5CF6' };
      default: return { icon: <Box color="#FFF" size={24} />, label: 'Box', color: '#6B7280' };
    }
  };

  const config = getBoxConfig();

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={handlePress}>
      <View style={[styles.avatarContainer, { backgroundColor: config.color }]}>
        {config.icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {Boolean(item.subtitle) && <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>}
      </View>
      <View style={[styles.typeChip, { backgroundColor: config.color + '20' }]}>
         <Text style={[styles.typeChipText, { color: config.color }]}>{config.label}</Text>
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
    borderRadius: 8 * scale,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    paddingRight: 8 * scale,
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
  typeChip: {
    paddingHorizontal: 8 * scale,
    paddingVertical: 4 * scale,
    borderRadius: 12 * scale,
  },
  typeChipText: {
    fontSize: 10 * scale,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  }
});
