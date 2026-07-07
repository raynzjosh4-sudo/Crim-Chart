import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { PermissionDialog } from '@/components/ui/PermissionDialog';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { DownloadCloud } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Platform } from 'react-native';
import Toast from 'react-native-toast-message';

export interface MediaDownloadWrapperProps {
  mediaUrl?: string;
  coverUrl?: string;
  title?: string;
  mediaType?: 'audio' | 'video' | 'image';
  onDownloadSuccess?: () => void;
  children: (props: { download: () => void; isDownloading: boolean }) => React.ReactNode;
}

export const MediaDownloadWrapper: React.FC<MediaDownloadWrapperProps> = ({
  mediaUrl,
  coverUrl,
  title = 'Media',
  mediaType = 'audio',
  onDownloadSuccess,
  children,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const getFileExtension = (url: string, defaultExt: string) => {
    try {
      const ext = url.split('.').pop()?.split('?')[0];
      if (ext && ext.length >= 2 && ext.length <= 4) return ext;
    } catch (e) { }
    return defaultExt;
  };

  const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  };

  const downloadFileToLibrary = async (url: string, fileName: string, albumName: string): Promise<boolean> => {
    try {
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      const { uri } = await FileSystem.downloadAsync(url, fileUri);

      // Create asset from cached file
      const asset = await MediaLibrary.createAssetAsync(uri);

      // Find or create the album (folder)
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (album == null) {
        try {
          await MediaLibrary.createAlbumAsync(albumName, asset, true);
        } catch (err) {
          console.warn('Failed to create nested album, falling back to flat name', err);
          const flatName = albumName.replace('/', ' - ');
          let flatAlbum = await MediaLibrary.getAlbumAsync(flatName);
          if (flatAlbum == null) {
            await MediaLibrary.createAlbumAsync(flatName, asset, true);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], flatAlbum, true);
          }
        }
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, true);
      }

      // Clean up cache
      await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => { });
      return true;
    } catch (e) {
      console.error(`Failed to download/save ${fileName}:`, e);
      return false;
    }
  };

  const handleDownload = async () => {
    if (!mediaUrl) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No media URL found to download.' });
      return;
    }

    if (isDownloading) return;

    try {
      if (Platform.OS === 'web') {
        setIsDownloading(true);
        ChartToast.showInfo(null, { title: 'Downloading...', message: `Starting download for ${title}` });

        const safeTitle = sanitizeFilename(title);
        let ext = mediaType === 'audio' ? 'mp3' : mediaType === 'video' ? 'mp4' : 'jpg';
        ext = getFileExtension(mediaUrl, ext);
        const mediaFileName = `${safeTitle}_${Date.now()}.${ext}`;

        const triggerDownload = async (url: string, fileName: string) => {
          try {
            // If it's a Supabase storage URL, we can leverage its native ?download parameter
            // which avoids CORS and Blob issues and properly sets Content-Disposition
            if (url.includes('supabase.co/storage')) {
              const downloadUrl = new URL(url);
              downloadUrl.searchParams.set('download', fileName);

              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = downloadUrl.toString();
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } else {
              // Try fetch first (works when CORS headers are present on CDN response)
              let blobUrl: string | null = null;
              try {
                const response = await fetch(url);
                if (response.ok) {
                  const blob = await response.blob();
                  blobUrl = window.URL.createObjectURL(blob);
                }
              } catch (_corsErr) {
                // CORS blocked — will fall through to direct link
              }

              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = blobUrl ?? url;
              a.download = fileName;
              // target _blank makes browsers download rather than navigate for cross-origin hrefs
              if (!blobUrl) a.target = '_blank';
              document.body.appendChild(a);
              a.click();
              if (blobUrl) window.URL.revokeObjectURL(blobUrl);
              document.body.removeChild(a);
            }
          } catch (e) {
            console.error("Web download failed:", e);
            window.open(url, '_blank');
          }
        };

        try {
          await triggerDownload(mediaUrl, mediaFileName);

          if (coverUrl) {
            // Delay the second download to avoid browser blocking multiple rapid downloads
            await new Promise(resolve => setTimeout(resolve, 1000));
            const coverExt = getFileExtension(coverUrl, 'jpg');
            const coverFileName = `${safeTitle}_cover_${Date.now()}.${coverExt}`;
            await triggerDownload(coverUrl, coverFileName);
          }

          ChartToast.showSuccess(null, {
            title: 'Download Started',
            message: 'Check your browser downloads.'
          });
          if (onDownloadSuccess) onDownloadSuccess();
        } finally {
          setIsDownloading(false);
        }
        return;
      }

      // 1. Request Permissions (Native)
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        setShowPermissionDialog(true);
        return;
      }

      setIsDownloading(true);
      ChartToast.showInfo(null, { title: 'Downloading...', message: `Saving ${title}` });

      const safeTitle = sanitizeFilename(title);

      // Determine Album Name
      let subFolder = 'crimgallary';
      if (mediaType === 'audio') subFolder = 'crimmusic';
      if (mediaType === 'video') subFolder = 'crimstrim';
      const albumName = `crimChart/${subFolder}`;

      // 2. Download the primary media
      let ext = mediaType === 'audio' ? 'mp3' : mediaType === 'video' ? 'mp4' : 'jpg';
      ext = getFileExtension(mediaUrl, ext);

      const mediaFileName = `${safeTitle}_${Date.now()}.${ext}`;
      const mediaSuccess = await downloadFileToLibrary(mediaUrl, mediaFileName, albumName);

      // 3. Optionally download the cover art as requested by user
      let coverSuccess = true;
      if (coverUrl && mediaSuccess) {
        const coverExt = getFileExtension(coverUrl, 'jpg');
        const coverFileName = `${safeTitle}_cover_${Date.now()}.${coverExt}`;
        coverSuccess = await downloadFileToLibrary(coverUrl, coverFileName, albumName);
      }

      if (mediaSuccess) {
        ChartToast.showSuccess(null, {
          title: 'Download Complete',
          message: coverUrl && coverSuccess ? 'Saved media and cover art to your gallery!' : 'Saved to your gallery!'
        });
        if (onDownloadSuccess) onDownloadSuccess();
      } else {
        throw new Error("Download failed");
      }

    } catch (error) {
      ChartToast.showError(null, { title: 'Download Failed', message: 'There was an error saving the file.' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenSettings = () => {
    setShowPermissionDialog(false);
    if (Platform.OS !== 'web') {
      Linking.openSettings();
    } else {
      alert("Please check your browser settings to allow downloads.");
    }
  };

  return (
    <>
      {children({ download: handleDownload, isDownloading })}
      <PermissionDialog
        visible={showPermissionDialog}
        title="Storage Permission Required"
        description="We need permission to save media to your gallery. Please enable it in your device settings."
        confirmText="Open Settings"
        icon={<DownloadCloud size={24} color="#FFC400" />}
        onCancel={() => setShowPermissionDialog(false)}
        onConfirm={handleOpenSettings}
      />
    </>
  );
};
