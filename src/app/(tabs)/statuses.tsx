import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, ViewToken } from 'react-native';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useFeedStatuses } from '@/statuses/hooks/useFeedStatuses';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { StatusFeedWidget } from '@/components/StatusFeedWidget/StatusFeedWidget';
import { formatTimeAgo } from '@/components/formatTimeAgo';

export default function StatusesPage() {
  const user = useAuthStore(s => s.user);
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const insets = useSafeAreaInsets();
  const { stopLoading } = useGlobalProgress();

  const { statuses: flatStatuses, refresh: refreshStatuses } = useFeedStatuses(user?.id);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  useEffect(() => {
    // We arrived here from navigation, stop loading
    stopLoading();
  }, [stopLoading]);

  // Keep track of which video is active based on viewability
  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 50 },
      onViewableItemsChanged: ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
          setActiveItemId(viewableItems[0].item.id);
        } else {
          setActiveItemId(null);
        }
      },
    },
  ]);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.feedItem}>
        <StatusFeedWidget
          author={{
            id: item.authorId,
            displayName: item.authorName,
            username: item.authorName,
            profileImageUrl: item.authorAvatarUrl,
          } as any}
          content={item.caption || ''}
          timeAgo={formatTimeAgo(item.createdAt)}
          imageUrls={item.imageUrls}
          videoUrl={item.videoUrl}
          audioUrl={item.audioUrl}
          thumbnailUrl={item.thumbnailUrl}
          metadata={item.metadata}
          statusId={item.id}
          isActive={activeItemId === item.id}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ChartAppBar title="Statuses" showBack={true} />

      <FlatList
        data={flatStatuses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      />
    </View>
  );
}

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 40 * scale,
  },
  feedItem: {
    marginBottom: 8 * scale,
  },
});
