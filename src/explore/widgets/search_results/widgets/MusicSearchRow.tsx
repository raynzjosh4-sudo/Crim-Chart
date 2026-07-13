import { useAppRouter } from '@/core/hooks/useAppRouter';
import { useStyles } from '@/core/hooks/useStyles';
import { useAppNavigation } from '@/core/navigation/useAppNavigation';
import { ThemeTokens } from '@/core/theme/themes';
import { useDesktopSearchStore } from '@/explore/application/useDesktopSearchStore';
import { Image } from 'expo-image';
import { Music, Play } from 'lucide-react-native';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlobalSearchResult } from '../../../models/GlobalSearchResult';

interface Props {
  item: GlobalSearchResult;
}

export const MusicSearchRow: React.FC<Props> = ({ item }) => {
  const styles = useStyles(themeStyles);
  const router = useAppRouter();
  const { withPremiumTransition } = useAppNavigation();

  const handlePress = async () => {
    const isDesktop = Platform.OS === 'web' && Dimensions.get('window').width >= 768;
    if (isDesktop) {
      useDesktopSearchStore.getState().openResult(item);
      return;
    }

    // Navigate or play the song
    await withPremiumTransition(async () => {
      console.log('Navigate to music post: ', item.entity_id);
      router.push(`/post/${item.entity_id}?type=${item.entity_type}`);
    });
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={handlePress}>
      <View style={styles.avatarContainer}>
        {item.image_url ? (
          <Image source={item.image_url} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.fallbackAvatar}>
            <Music color="#FFF" size={24} />
          </View>
        )}
        <View style={styles.playOverlay}>
          <Play fill="#FFF" color="#FFF" size={16} />
        </View>
        <View style={styles.musicBadge}>
          <Music color="#000" size={10} />
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
    borderRadius: 8 * scale, // Rounded square
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
  musicBadge: {
    position: 'absolute' as const,
    bottom: -4 * scale,
    right: -4 * scale,
    backgroundColor: colors.primary,
    borderRadius: 8 * scale,
    padding: 2 * scale,
    borderWidth: 1.5 * scale,
    borderColor: colors.background,
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
