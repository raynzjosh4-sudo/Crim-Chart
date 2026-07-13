import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { useStyles } from "@/core/hooks/useStyles";
import { useSearchStore } from '@/core/store/useSearchStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { colors } from '@/core/theme/colors';
import { ThemeTokens } from '@/core/theme/themes';
import { SearchResultRow } from '@/explore/widgets/search_results/SearchResultRow';
import { SearchResultsSkeleton } from '@/explore/widgets/search_results/SearchResultsSkeleton';
import { Box, Crown, Music, Play, Radio, Search, User } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mobile vs Desktop responsive max width
const MAX_CONTENT_WIDTH = Platform.OS === 'web' ? 800 : SCREEN_WIDTH;

export default function ExploreScreen() {
  const styles = useStyles(themeStyles);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const theme = useCurrentTheme();

  const { query, setQuery, results, isSearching, hasSearched, search, clearSearch } = useSearchStore();

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const filters = ['All', 'Music', 'People', 'Channels', 'Crowns', 'Posts', 'Videos', 'Boxes'];

  const filteredResults = useMemo(() => {
    if (activeFilter === 'All') return results;
    return results.filter(item => {
      switch (activeFilter) {
        case 'Music': return item.entity_type.includes('music');
        case 'People': return item.entity_type === 'profile';
        case 'Channels': return item.entity_type === 'channel';
        case 'Crowns': return item.entity_type === 'crown';
        case 'Posts': return item.entity_type === 'post' || item.entity_type === 'channel_post';
        case 'Videos': return item.entity_type.includes('video');
        case 'Boxes': return item.entity_type.includes('box');
        default: return true;
      }
    });
  }, [results, activeFilter]);

  const handleSearchChange = (text: string) => {
    setQuery(text);
    search(text);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => clearSearch();
  }, [clearSearch]);

  const renderEmptyState = () => {
    if (isSearching) {
      return <SearchResultsSkeleton />;
    }

    if (hasSearched && filteredResults.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIconCircle}>
            <Search color={colors.textSecondary} size={32} />
          </View>
          <Text style={styles.emptyStateTitle}>{t('no_results')}</Text>
          <Text style={styles.emptyStateSubtitle}>{t('no_results_subtitle')}</Text>
        </View>
      );
    }

    if (!hasSearched) {
      // Show quick category pills when haven't searched yet
      return (
        <View style={styles.categoriesContainer}>
          <CategoryPill icon={<User color="#FFF" size={14} />} label={t('search_people')} />
          <CategoryPill icon={<Radio color="#FFF" size={14} />} label={t('search_channels')} />
          <CategoryPill icon={<Music color="#FFF" size={14} />} label={t('search_music')} />
          <CategoryPill icon={<Play color="#FFF" size={14} />} label={t('search_videos')} />
          <CategoryPill icon={<Box color="#FFF" size={14} />} label={t('search_boxes')} />
          <CategoryPill icon={<Crown color="#FFF" size={14} />} label={t('search_crowns')} />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ChartAppBar title={t('explore') || 'Explore'} showBack={false} />

      <View style={styles.contentWrapper}>
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <Search size={20} color="rgba(255, 255, 255, 0.5)" />
            <TextInput
              style={[styles.searchInput, Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}]}
              placeholder={t('search_placeholder') || 'Search...'}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={query}
              onChangeText={handleSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {hasSearched && (
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {filters.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <FlatList
          data={filteredResults}
          keyExtractor={item => `${item.entity_type}_${item.entity_id}`}
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => <SearchResultRow item={item} />}
          ListEmptyComponent={renderEmptyState}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </View>
  );
}

// Simple internal component for the categories
const CategoryPill = ({ icon, label }: { icon: React.ReactNode, label: string }) => {
  const styles = useStyles(themeStyles);
  return (
    <TouchableOpacity style={styles.categoryPill} activeOpacity={0.8}>
      {icon}
      <Text style={styles.categoryPillText}>{label}</Text>
    </TouchableOpacity>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  searchHeader: {
    paddingHorizontal: 16 * scale,
    paddingVertical: 12 * scale,
  },
  searchBar: {
    height: 48 * scale,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 24 * scale,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16 * scale,
    gap: 12 * scale
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16 * scale,
  },
  filterContainer: {
    marginBottom: 8 * scale,
  },
  filterScroll: {
    paddingHorizontal: 16 * scale,
    gap: 8 * scale,
  },
  filterChip: {
    paddingHorizontal: 16 * scale,
    paddingVertical: 8 * scale,
    borderRadius: 20 * scale,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 14 * scale,
    fontWeight: '600' as const,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  listPadding: {
    paddingBottom: 100 * scale,
  },

  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingTop: 80 * scale,
    paddingHorizontal: 32 * scale,
  },
  emptyStateIconCircle: {
    width: 80 * scale,
    height: 80 * scale,
    borderRadius: 40 * scale,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 24 * scale,
  },
  emptyStateTitle: {
    fontSize: 20 * scale,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8 * scale,
    textAlign: 'center' as const,
  },
  emptyStateSubtitle: {
    fontSize: 14 * scale,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20 * scale,
  },

  // Categories Styles
  categoriesContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    paddingHorizontal: 16 * scale,
    gap: 12 * scale,
    paddingTop: 12 * scale,
  },
  categoryPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12 * scale,
    paddingVertical: 6 * scale,
    borderRadius: 16 * scale,
    gap: 6 * scale,
  },
  categoryPillText: {
    color: colors.text,
    fontSize: 13 * scale,
    fontWeight: '600' as const,
  }
});