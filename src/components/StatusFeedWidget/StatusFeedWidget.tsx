import React, { useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { PostHeader } from '@/components/PostHeader/PostHeader';
import { PostContent } from '@/channel/ChannelComponents/ChnnelMainPostCard/postCardFiles/PostContent';
import { PostOptionsSheet } from '@/components/postOptionsSheet/PostOptionsSheet';
import { useRouter } from 'expo-router';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';

import { StatusImageWidget } from './sub_widgets/StatusImageWidget';
import { StatusAudioWidget } from './sub_widgets/StatusAudioWidget';
import { StatusVideoWidget } from './sub_widgets/StatusVideoWidget';

export interface StatusFeedWidgetProps {
  author: CrimChartUserModel;
  content: string;
  timeAgo: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  thumbnailUrl?: string | null;
  metadata?: any;
  statusId: string;
  isActive?: boolean;
}

export const StatusFeedWidget: React.FC<StatusFeedWidgetProps> = ({
  author,
  content,
  timeAgo,
  imageUrl,
  imageUrls,
  videoUrl,
  audioUrl,
  thumbnailUrl,
  metadata,
  statusId,
  isActive,
}) => {
  const router = useRouter();
  const [postOptionsVisible, setPostOptionsVisible] = useState(false);
  const [postOptionsPosition, setPostOptionsPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const { startLoading, stopLoading } = useGlobalProgress();
  const currentUserId = useAuthStore(state => state.user?.id);

  const handleDeleteStatus = React.useCallback(async () => {
    try {
      startLoading();
      // Statuses are stored in 'profile_media' table
      await supabase.from('profile_media').delete().eq('id', statusId);
    } catch (err) {
      console.error('[StatusFeedWidget] delete error:', err);
    } finally {
      stopLoading();
    }
  }, [statusId, startLoading, stopLoading]);

  const allImages = React.useMemo(() => {
    const imgs: string[] = [];
    if (imageUrl) imgs.push(imageUrl);
    if (imageUrls) imgs.push(...imageUrls);
    return Array.from(new Set(imgs));
  }, [imageUrl, imageUrls]);

  const goToProfile = () => {
    if (author?.id) {
      router.push(`/profile/${author.id}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <PostHeader
        author={author}
        timeAgo={timeAgo}
        onAvatarTap={goToProfile}
        onMoreTap={async (e: any) => {
          startLoading();
          await new Promise(r => setTimeout(r, 400));
          stopLoading();
          if (Platform.OS === 'web' && e?.nativeEvent) {
            setPostOptionsPosition({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
          }
          setPostOptionsVisible(true);
        }}
      />

      {/* Content */}
      <PostContent content={content} />

      {/* Media Sub-Widgets */}
      {audioUrl ? (
        <StatusAudioWidget 
          audioUrl={audioUrl}
          thumbnailUrl={thumbnailUrl ?? undefined}
          metadata={metadata}
          statusId={statusId}
        />
      ) : videoUrl ? (
        <StatusVideoWidget 
          videoUrl={videoUrl}
          thumbnailUrl={thumbnailUrl ?? undefined}
          isActive={isActive}
        />
      ) : allImages.length > 0 ? (
        <StatusImageWidget images={allImages} />
      ) : null}

      {/* Footer - Only timeAgo */}
      <View style={styles.footer}>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>

      <PostOptionsSheet
        postId={statusId}
        authorId={author?.id}
        authorName={author?.username}
        authorAvatarUrl={author?.profileImageUrl}
        visible={postOptionsVisible}
        onClose={() => setPostOptionsVisible(false)}
        anchorPosition={postOptionsPosition}
        onDeletePost={currentUserId === author?.id ? handleDeleteStatus : undefined}
      />
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  container: {
    paddingVertical: 12 * scale,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  footer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16 * scale,
    paddingTop: 12 * scale,
  },
  timeAgo: {
    color: colors.textSecondary,
    fontSize: 13 * scale,
    fontWeight: '600' as const,
  },
});
