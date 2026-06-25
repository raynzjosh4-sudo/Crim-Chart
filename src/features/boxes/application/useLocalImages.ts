import { useMediaPermissions } from '@/core/hooks/useMediaPermissions';
import * as MediaLibrary from 'expo-media-library';
import { useState } from 'react';
import { create } from 'zustand';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

interface LocalImageStore {
  localImages: any[];
  hasMoreLocalImages: boolean;
  localMediaCursor: string | undefined;
  selectedAlbum: string | null;
  setLocalImages: (images: any[]) => void;
  setHasMoreLocalImages: (hasMore: boolean) => void;
  setLocalMediaCursor: (cursor: string | undefined) => void;
  setSelectedAlbum: (album: string | null) => void;
}

const useLocalImageStore = create<LocalImageStore>((set) => ({
  localImages: [],
  hasMoreLocalImages: true,
  localMediaCursor: undefined,
  selectedAlbum: null,
  setLocalImages: (images) => set({ localImages: images }),
  setHasMoreLocalImages: (hasMore) => set({ hasMoreLocalImages: hasMore }),
  setLocalMediaCursor: (cursor) => set({ localMediaCursor: cursor }),
  setSelectedAlbum: (album) => set({ selectedAlbum: album }),
}));

export const useLocalImages = () => {
  const {
    localImages,
    hasMoreLocalImages,
    localMediaCursor,
    selectedAlbum,
    setLocalImages,
    setHasMoreLocalImages,
    setLocalMediaCursor,
    setSelectedAlbum
  } = useLocalImageStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useAuthStore(state => state.user);

  const {
    showPermissionDialog,
    setShowPermissionDialog,
    needsSettings,
    handlePermissionConfirm,
    requestMediaPermission,
  } = useMediaPermissions();

  const loadLocalImages = async (albumOverride?: string | null, cursorOverride?: string | undefined, clearCurrent?: boolean) => {
    const isFetchingNewAlbum = albumOverride !== undefined;
    if (!hasMoreLocalImages && !isFetchingNewAlbum) return;
    if (isLoading) return;

    const hasPermission = await requestMediaPermission();
    if (!hasPermission) return;

    const albumToUse = albumOverride !== undefined ? albumOverride : selectedAlbum;
    const cursorToUse = cursorOverride !== undefined ? cursorOverride : localMediaCursor;

    setIsLoading(true);
    try {
      const mediaPage = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 20, // Load photos in larger batches than videos
        after: cursorToUse,
        album: albumToUse ? albumToUse : undefined,
      });

      const newLocalImages: any[] = mediaPage.assets.map(asset => ({
        id: asset.id,
        title: asset.filename.replace(/\.[^/.]+$/, ''),
        description: 'Local device photo',
        price: '',
        mediaUrl: asset.uri,
        seller: {
          id: 'local_user',
          name: currentUser?.displayName || currentUser?.username || 'My Device',
          avatarUrl: currentUser?.profileImageUrl || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop'
        },
        likes: 0,
        commentsCount: 0,
      }));

      setLocalImages(clearCurrent ? newLocalImages : [...localImages, ...newLocalImages]);
      setLocalMediaCursor(mediaPage.endCursor);
      setHasMoreLocalImages(mediaPage.hasNextPage);
    } catch (error) {
      console.error('Error fetching local images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    localImages,
    isLoading,
    hasMoreLocalImages,
    loadLocalImages,
    showPermissionDialog,
    setShowPermissionDialog,
    needsSettings,
    handlePermissionConfirm,
    selectedAlbum,
    setSelectedAlbum,
    setLocalImages
  };
};
