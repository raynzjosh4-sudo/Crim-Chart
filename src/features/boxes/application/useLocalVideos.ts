import { useMediaPermissions } from '@/core/hooks/useMediaPermissions';
import * as MediaLibrary from 'expo-media-library';
import { useState } from 'react';

export const useLocalVideos = () => {
  const [localVideos, setLocalVideos] = useState<any[]>([]);
  const [hasMoreLocalVideos, setHasMoreLocalVideos] = useState(true);
  const [localMediaCursor, setLocalMediaCursor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  const {
    showPermissionDialog,
    setShowPermissionDialog,
    needsSettings,
    handlePermissionConfirm,
    requestMediaPermission,
  } = useMediaPermissions();

  const loadLocalVideo = async (albumOverride?: string | null, cursorOverride?: string | undefined, clearCurrent?: boolean) => {
    const isFetchingNewAlbum = albumOverride !== undefined;
    // Guard: prevent overlapping calls
    if (!hasMoreLocalVideos && !isFetchingNewAlbum) return;
    if (isLoading) return;

    const hasPermission = await requestMediaPermission();
    if (!hasPermission) return;

    const albumToUse = albumOverride !== undefined ? albumOverride : selectedAlbum;
    const cursorToUse = cursorOverride !== undefined ? cursorOverride : localMediaCursor;

    setIsLoading(true);
    try {
      const mediaPage = await MediaLibrary.getAssetsAsync({
        mediaType: 'video',
        first: 10,
        after: cursorToUse,
        album: albumToUse ? albumToUse : undefined,
      });

      // Skip expo-video-thumbnails entirely — generating thumbnails via video
      // frame extraction is extremely CPU/GPU intensive and heats up the device.
      // We use the asset's content URI directly; expo-image renders it natively
      // without any additional decoding overhead.
      const newLocalVideos: any[] = mediaPage.assets.map(asset => {
        const minutes = Math.floor(asset.duration / 60);
        const seconds = Math.floor(asset.duration % 60).toString().padStart(2, '0');

        return {
          id: asset.id,
          title: asset.filename.replace(/\.[^/.]+$/, ''),
          director: 'Local Device',
          thumbnailUrl: asset.uri,   // content:// URI — no decoding needed
          videoUrl: asset.uri,
          duration: `${minutes}:${seconds}`,
          likes: 0,
          dislikes: 0,
          viewsCount: 0,
          commentsCount: 0,
          addedBy: {
            id: 'local_user',
            name: 'My Device',
            avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop'
          },
          isShort: asset.height > asset.width
        };
      });

      setLocalVideos(clearCurrent ? newLocalVideos : [...localVideos, ...newLocalVideos]);
      setLocalMediaCursor(mediaPage.endCursor);
      setHasMoreLocalVideos(mediaPage.hasNextPage);
    } catch (error) {
      console.error('Error loading local video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    localVideos,
    loadLocalVideo,
    showPermissionDialog,
    setShowPermissionDialog,
    needsSettings,
    handlePermissionConfirm,
    hasMoreLocalVideos,
    isLoading,
    selectedAlbum,
    setSelectedAlbum
  };
};
