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

interface DesktopStatusGridProps {
  isExpanded: boolean;
  targetUserId?: string;
}

export const DesktopStatusGrid = ({ isExpanded, targetUserId }: DesktopStatusGridProps) => {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);

  const { statuses: flatStatuses, refresh: refreshStatuses } = useFeedStatuses(user?.id);

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
          thumbnailUrl: status.thumbnailUrl || status.imageUrls[0] || status.authorAvatarUrl || '',
          hasUnseen: true,
          statuses: []
        });
      }
      userMap.get(status.authorId)!.statuses!.push(status);
    });

    return Array.from(userMap.values());
  }, [flatStatuses]);

  const handleAddStatusPress = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedMedia = result.assets.map((asset, index) => ({
          id: `status-media-${Date.now()}-${index}`,
          path: asset.uri,
          type: asset.type === 'video' ? 'video' : 'photo',
          width: asset.width,
          height: asset.height,
        }));

        router.push({
          pathname: '/finalize-post',
          params: {
            selectedMediaJson: JSON.stringify(selectedMedia),
            isGlobalStatus: 'true',
          }
        });
      }
    } catch (e) {
      console.error('Error picking status media:', e);
    }
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
        {itemsToShow.map((item) => (
          <View key={item.id} style={styles.gridItem}>
            <StatusCard
              username={item.user.displayName || item.user.username || 'Unknown'}
              avatarUrl={item.user.profileImageUrl}
              statusImageUrl={item.thumbnailUrl}
              hasUnseen={item.hasUnseen}
              statusCount={item.statuses?.length || 1}
              onPress={() => {
                // Future: handle viewing desktop statuses
              }}
            />
          </View>
        ))}
      </View>
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
    justifyContent: 'space-between' as const,
  },
  gridItem: {
    width: '31%', // Fits 3 per row with space-between
    marginBottom: 12 * scale,
    aspectRatio: 100 / 160, // Matches StatusCard ratio
    alignItems: 'center' as const,
  }
});
