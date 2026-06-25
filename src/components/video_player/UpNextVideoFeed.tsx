import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { supabase } from '@/core/supabase/supabaseConfig';
import { GeneralVideoPlayer } from './players/GeneralVideoPlayer';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { useStyles } from '@/core/hooks/useStyles';
import { ThemeTokens } from '@/core/theme/themes';
import { useRouter } from 'expo-router';

interface UpNextVideoFeedProps {
  currentVideoId?: string;
  onVideoPress?: (params: any) => void;
}

export const UpNextVideoFeed: React.FC<UpNextVideoFeedProps> = ({
  currentVideoId,
  onVideoPress,
}) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useCurrentTheme();
  const styles = useStyles(themeStyles);
  const router = useRouter();

  useEffect(() => {
    const fetchUpNext = async () => {
      try {
        let query = supabase
          .from('unified_channel_posts_view')
          .select('*')
          .eq('is_video', true)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (currentVideoId) {
          query = query.neq('id', currentVideoId);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          const mappedVideos = data.map((row: any) => ({
            id: row.id,
            title: row.caption || 'Untitled Video',
            director: row.author?.display_name || 'Unknown User',
            thumbnailUrl: (row.thumbnail_urls && row.thumbnail_urls.length > 0) ? row.thumbnail_urls[0] : null,
            duration: '0:00', // We don't have duration in this view currently
            likes: row.likes || 0,
            dislikes: 0,
            commentsCount: row.comments || 0,
            viewsCount: 0,
            createdAt: row.created_at,
            videoUrl: row.video_url || (row.video_urls && row.video_urls.length > 0 ? row.video_urls[0] : null),
            sourceTable: row.source_table,
            addedBy: row.author ? {
              id: row.author.id,
              name: row.author.display_name,
              avatarUrl: row.author.profile_image_url,
            } : undefined,
          }));

          setVideos(mappedVideos);
        }
      } catch (err) {
        console.error('Failed to fetch Up Next videos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpNext();
  }, [currentVideoId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.upNextTitle}>Up Next</Text>
      {videos.map((video) => (
        <View key={video.id}>
          <GeneralVideoPlayer
            video={video}
            disableVideoPlayer={true}
            onVideoPress={(params) => {
              if (onVideoPress) {
                onVideoPress(params);
              }
            }}
          />
        </View>
      ))}
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    paddingTop: 16 * scale,
    paddingBottom: 40 * scale,
  },
  loadingContainer: {
    paddingVertical: 32 * scale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upNextTitle: {
    color: colors.text,
    fontSize: 18 * scale,
    fontWeight: '800' as const,
    marginLeft: 16 * scale,
    marginBottom: 16 * scale,
  },
});
