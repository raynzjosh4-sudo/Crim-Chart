import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Crown } from 'lucide-react-native';
import { GlobalSearchResult } from '../../../models/GlobalSearchResult';
import { useStyles } from '@/core/hooks/useStyles';
import { useAppRouter } from '@/core/hooks/useAppRouter';
import { useDesktopSearchStore } from '@/explore/application/useDesktopSearchStore';
import { ThemeTokens } from '@/core/theme/themes';

interface Props {
  item: GlobalSearchResult;
}

export const CrownSearchRow: React.FC<Props> = ({ item }) => {
  const styles = useStyles(themeStyles);
  const router = useAppRouter();

  const handlePress = () => {
    const isDesktop = Platform.OS === 'web' && Dimensions.get('window').width >= 768;
    if (isDesktop) {
      useDesktopSearchStore.getState().openResult(item);
    } else {
      router.push(`/crown/${item.entity_id}`);
    }
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={handlePress}>
      <View style={styles.avatarContainer}>
        <Crown color="#F59E0B" size={24} fill="#F59E0B" />
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
    borderRadius: 24 * scale,
    backgroundColor: '#F59E0B20', // Light amber background
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
    color: '#F59E0B', // Amber color for crowns
    marginBottom: 2 * scale,
  },
  subtitle: {
    fontSize: 13 * scale,
    color: colors.textSecondary,
  },
});
