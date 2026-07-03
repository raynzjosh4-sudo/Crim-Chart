import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useFeedStatuses } from '@/statuses/hooks/useFeedStatuses';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { AddStatusCard } from './AddStatusCard';
import { StatusCard } from './StatusCard';
import { StatusItem } from './UserStatusWidget';
import { useDesktopComposeStore } from '@/core/store/useDesktopComposeStore';
import { PostType } from '@/core/store/usePostingStore';
import { StatusViewer, StatusGroup } from '@/channel/pages/widgets2/status/StatusViewer';
import { useState } from 'react';

import { useViewedStatusStore } from '@/core/store/useViewedStatusStore';

interface DesktopStatusGridProps {
  isExpanded: boolean;
  targetUserId?: string;
}

export const DesktopStatusGrid = ({ isExpanded, targetUserId }: DesktopStatusGridProps) => {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const { statuses: flatStatuses, refresh: refreshStatuses } = useFeedStatuses(user?.id);
  const viewedStatusIds = useViewedStatusStore(s => s.viewedStatusIds);

  const groupedStatuses = React.useMemo(() => {
    const userMap = new Map<string, StatusItem>();

    flatStatuses.forEach(status => {
      if (targetUserId && status.authorId !== targetUserId) return;

      if (!userMap.has(status.authorId)) {
        userMap.set(status.authorId, {
          id: status.authorId,
          user: {
            id: status.authorId,
            displayName: status.authorName,
            username: status.authorName,
            profileImageUrl: status.authorAvatarUrl
          } as any,
          thumbnailUrl: status.thumbnailUrl || status.imageUrls?.[0] || null,
          hasUnseen: false, // Calculated below
          statuses: []
        });
      }
      userMap.get(status.authorId)!.statuses!.push(status);
    });

    const result = Array.from(userMap.values());
    result.forEach(group => {
      group.hasUnseen = group.statuses!.some(s => !viewedStatusIds[s.id]);
    });
    return result;
  }, [flatStatuses, targetUserId, viewedStatusIds]);

  const statusGroups = React.useMemo((): StatusGroup[] => {
    return groupedStatuses.map((group) => ({
      id: group.id,
      channelName: group.user.displayName || group.user.username || 'Unknown',
      avatarUrl: group.user.profileImageUrl || '',
      media: group.statuses.map((s: any) => ({
        id: s.id,
        url: s.videoUrl || s.audioUrl || s.imageUrls?.[0] || '',
        type: s.isVideo ? 'video' : s.isAudio ? 'video' : 'image', // Treat audio as video to let expo-video play it
        isAudio: s.isAudio,
        caption: s.caption || '',
        thumbnail: s.thumbnailUrl || s.imageUrls?.[0] || '',
        title: s.metadata?.title,
        artist: s.metadata?.artist,
        lyrics: s.metadata?.lyrics,
      }))
    }));
  }, [groupedStatuses]);

  const handleAddStatusPress = async () => {
    useDesktopComposeStore.getState().openModal({ postType: PostType.status });
  };

  // If collapsed, we just don't show the grid to keep it clean, or we could show tiny avatars
  if (!isExpanded) {
    return null;
  }

  // Calculate items to show: AddStatusCard + user statuses
  // 3 rows x 3 cols = 9 items max to keep the sidebar clean.
  const MAX_ITEMS = 9;
  const itemsToShow = groupedStatuses.slice(0, MAX_ITEMS - 1); // 1 slot for AddStatusCard

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Statuses</Text>
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <AddStatusCard
            avatarUrl={user?.profileImageUrl}
            onPress={handleAddStatusPress}
          />
        </View>
        {itemsToShow.map((item, index) => (
          <View key={item.id} style={styles.gridItem}>
            <StatusCard
              username={item.user.displayName || item.user.username || 'Unknown'}
              avatarUrl={item.user.profileImageUrl}
              statusImageUrl={item.thumbnailUrl}
              isAudio={item.statuses?.some((s: any) => s.isAudio) ?? false}
              hasUnseen={item.hasUnseen}
              statusCount={item.statuses?.length || 1}
              onPress={() => {
                setViewerInitialIndex(index);
                setViewerVisible(true);
              }}
            />
          </View>
        ))}
      </View>

      {viewerVisible && (
        <StatusViewer
          visible={viewerVisible}
          onClose={() => setViewerVisible(false)}
          statusGroups={statusGroups}
          initialGroupIndex={viewerInitialIndex}
        />
      )}
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    paddingHorizontal: 12 * scale,
    paddingVertical: 16 * scale,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18 * scale,
    fontWeight: '800' as const,
    marginBottom: 12 * scale,
    marginLeft: 4 * scale,
  },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8 * scale,
  },
  gridItem: {
    width: 90 * scale,
    height: 144 * scale,
  }
});
