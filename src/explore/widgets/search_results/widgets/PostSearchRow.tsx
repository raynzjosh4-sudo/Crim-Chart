import React from 'react';
import { View, Text, TouchableOpacity, Platform, Dimensions, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Image as ImageIcon } from 'lucide-react-native';
import { GlobalSearchResult } from '../../../models/GlobalSearchResult';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';
import { useDesktopSearchStore } from '@/explore/application/useDesktopSearchStore';
import { useAppRouter } from '@/core/hooks/useAppRouter';

interface Props {
  item: GlobalSearchResult;
}

export const PostSearchRow: React.FC<Props> = ({ item }) => {
  const styles = useStyles(themeStyles);
  const router = useAppRouter();

  const handlePress = () => {
    const isDesktop = Platform.OS === 'web' && Dimensions.get('window').width >= 768;
    if (isDesktop) {
      useDesktopSearchStore.getState().openResult(item);
    } else {
      router.push(`/post/${item.entity_id}?type=${item.entity_type}`);
    }
  };

  const imageUrls = item.image_url ? item.image_url.split(',').map(u => u.trim()).filter(Boolean) : [];

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={handlePress}>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{item.title || 'Untitled Post'}</Text>
        {Boolean(item.subtitle) && <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>}
      </View>
      
      {imageUrls.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScrollContainer}>
          {imageUrls.map((url, idx) => (
            <View key={idx}>
              <Image source={url} style={styles.thumbnail} contentFit="cover" />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScrollContainer}>
          <View style={styles.fallbackContainer}>
              <ImageIcon color="#FFF" size={24} />
          </View>
        </ScrollView>
      )}
    </TouchableOpacity>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  container: {
    paddingHorizontal: 16 * scale,
    paddingVertical: 12 * scale,
    borderBottomWidth: 0.5 * scale,
    borderBottomColor: colors.surfaceVariant,
  },
  textContainer: {
    marginBottom: 8 * scale,
  },
  title: {
    fontSize: 16 * scale,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2 * scale,
  },
  subtitle: {
    fontSize: 14 * scale,
    color: colors.textSecondary,
  },
  imageScrollContainer: {
    gap: 8 * scale,
    paddingBottom: 4 * scale,
  },
  thumbnail: {
    width: 80 * scale,
    height: 80 * scale,
    borderRadius: 8 * scale,
    backgroundColor: colors.surfaceVariant,
  },
  fallbackContainer: {
    width: 80 * scale,
    height: 80 * scale,
    borderRadius: 8 * scale,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
