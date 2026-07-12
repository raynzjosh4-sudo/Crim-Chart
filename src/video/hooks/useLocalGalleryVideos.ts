import { useState, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { VideoPost } from '../models/VideoPost';

export const useLocalGalleryVideos = () => {
  const [localVideos, setLocalVideos] = useState<VideoPost[]>([]);
  const [isFetchingLocal, setIsFetchingLocal] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const fetchLocalVideos = useCallback(async () => {
    try {
      setIsFetchingLocal(true);
      
      let hasPermission = permissionResponse?.granted;
      
      if (!hasPermission) {
        const result = await requestPermission();
        hasPermission = result.granted;
      }

      if (!hasPermission) {
        setIsFetchingLocal(false);
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        mediaType: ['video'],
        first: 30,
        sortBy: ['creationTime'],
      });

      const mapped: VideoPost[] = media.assets.map((asset) => ({
        id: `local-${asset.id}`,
        postId: asset.id,
        videoUrl: asset.uri,
        caption: 'Offline mode • Playing from your Camera Roll',
        authorId: 'local-user',
        authorName: 'Your Gallery',
        authorAvatarUrl: '', // Fallback icon will be shown
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
        createdAt: new Date(asset.creationTime),
        isCompetition: false,
        chartPoints: 0,
        isCharted: false,
        sharesCount: 0,
        tagsCount: 0,
        sourceType: 'local_gallery',
      }));

      setLocalVideos(mapped);
    } catch (error) {
      console.error('[useLocalGalleryVideos] Error fetching local videos:', error);
    } finally {
      setIsFetchingLocal(false);
    }
  }, [permissionResponse, requestPermission]);

  return { localVideos, fetchLocalVideos, isFetchingLocal };
};
