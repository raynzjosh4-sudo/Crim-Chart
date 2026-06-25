import { LongVideoPlayerLayout } from '@/components/video_player/LongVideoPlayerLayout';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function VideoPlayerPage() {
  const { 
    videoUrl, title, director, description, isLocal,
    videoId, directorId, directorAvatarUrl, likesCount, viewsCount, commentsCount, isLiked, isAdded, sourceTable
  } = useLocalSearchParams<{
    videoUrl: string;
    title: string;
    director: string;
    description: string;
    isLocal: string;
    videoId?: string;
    directorId?: string;
    directorAvatarUrl?: string;
    likesCount?: string;
    viewsCount?: string;
    commentsCount?: string;
    isLiked?: string;
    isAdded?: string;
    sourceTable?: string;
  }>();

  const router = useRouter();

  if (!videoUrl) return null;

  return (
    <LongVideoPlayerLayout
      videoUrl={videoUrl}
      title={title || ''}
      director={director || ''}
      description={description || ''}
      isLocal={isLocal === 'true'}
      onClose={() => router.back()}
      listData={[]}
      renderItem={() => null}
      videoId={videoId}
      directorId={directorId}
      directorAvatarUrl={directorAvatarUrl}
      likesCount={likesCount ? Number(likesCount) : undefined}
      viewsCount={viewsCount ? Number(viewsCount) : undefined}
      commentsCount={commentsCount ? Number(commentsCount) : undefined}
      isLiked={isLiked === 'true'}
      isAdded={isAdded === 'true'}
      sourceTable={sourceTable}
    />
  );
}
