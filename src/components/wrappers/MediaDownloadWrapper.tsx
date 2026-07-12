import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { PermissionDialog } from '@/components/ui/PermissionDialog';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { DownloadCloud } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { RequireAuthWrapper } from './RequireAuthWrapper';

// Ensure notifications show even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

      // FIX: Added generic headers to bypass basic Cloudflare bot protection
      const { uri, status } = await FileSystem.downloadAsync(url, fileUri, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Mobile; App)',
          'Accept': '*/*'
        }
      });

      // CRITICAL FIX: downloadAsync doesn't throw on 403/404, it just downloads the error page!
      if (status !== 200) {
        await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => { });
        throw new Error(`Cloudflare returned HTTP ${status}. The file might be private or blocked.`);
      }

      // iOS Limitation check
      if (Platform.OS === 'ios' && (fileName.endsWith('.mp3') || fileName.endsWith('.wav'))) {
        console.warn('iOS MediaLibrary does not support audio. Consider using expo-sharing for iOS audio.');
        // It will likely fail on the next line for iOS.
      }

      const asset = await MediaLibrary.createAssetAsync(uri);

      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (album == null) {
        try {
          await MediaLibrary.createAlbumAsync(albumName, asset, true);
        } catch (err) {
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
              try {
                // 1. Create a safe URL object to avoid breaking existing query parameters
                const safeUrl = new URL(url);

                // 2. Add a random timestamp to force bypass the browser cache
                safeUrl.searchParams.set('nocache', Date.now().toString());

                // 3. Fetch using the new cache-busted URL
                const response = await fetch(safeUrl.toString(), {
                  mode: 'cors',
                  credentials: 'omit',
                  referrerPolicy: 'no-referrer',
                  cache: 'no-store' // 4. Tell the browser explicitly not to use the cache
                });

                if (response.ok) {
                  const blob = await response.blob();

                  // Extra check: if Cloudflare sends us a JSON or HTML error page disguised as a successful response
                  if (blob.type.includes('text/html') || blob.type.includes('application/json')) {
                    ChartToast.showError(null, { title: 'Download Blocked', message: 'The server blocked the download.' });
                    return;
                  }

                  const blobUrl = window.URL.createObjectURL(blob);

                  const a = document.createElement('a');
                  a.style.display = 'none';
                  a.href = blobUrl;
                  a.download = fileName;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(blobUrl);
                  document.body.removeChild(a);
                } else {
                  ChartToast.showError(null, { title: 'Download Failed', message: `Server returned ${response.status}` });
                  console.warn(`Fetch failed with status: ${response.status}`);
                }
              } catch (_corsErr: any) {
                console.warn("CORS Error caught:", _corsErr);
                ChartToast.showError(null, { title: 'Network Error', message: 'CORS or network error. See console.' });
              }
            }
          } catch (e) {
            console.error("Web download failed:", e);
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        };

        try {
          // Download primary media
          await triggerDownload(mediaUrl, mediaFileName);

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

      // NATIVE FLOW (Android / iOS)
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        setShowPermissionDialog(true);
        return;
      }

      setIsDownloading(true);
      ChartToast.showInfo(null, { title: 'Downloading...', message: `Saving ${title}` });

      const safeTitle = sanitizeFilename(title);

      let subFolder = 'crimgallary';
      if (mediaType === 'audio') subFolder = 'crimmusic';
      if (mediaType === 'video') subFolder = 'crimstrim';
      const albumName = `crimChart/${subFolder}`;

      let ext = mediaType === 'audio' ? 'mp3' : mediaType === 'video' ? 'mp4' : 'jpg';
      ext = getFileExtension(mediaUrl, ext);

      const mediaFileName = `${safeTitle}_${Date.now()}.${ext}`;
      const mediaSuccess = await downloadFileToLibrary(mediaUrl, mediaFileName, albumName);

      let coverSuccess = true;
      if (coverUrl && mediaSuccess) {
        const coverExt = getFileExtension(coverUrl, 'jpg');
        const coverFileName = `${safeTitle}_cover_${Date.now()}.${coverExt}`;
        coverSuccess = await downloadFileToLibrary(coverUrl, coverFileName, albumName);
      }

      if (mediaSuccess) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Download Complete',
              body: `Saved to your device in album: ${albumName}`,
            },
            trigger: null, // trigger immediately
          });
        } catch (e) {
          console.warn("Failed to schedule notification:", e);
          // Fallback to Toast if notifications fail (e.g. permission denied)
          ChartToast.showSuccess(null, {
            title: 'Download Complete',
            message: `Saved to your device in album: ${albumName}`
          });
        }
        if (onDownloadSuccess) onDownloadSuccess();
      } else {
        throw new Error("Download failed");
      }

    } catch (error) {
      ChartToast.showError(null, { title: 'Download Failed', message: 'There was an error saving the file. Check console.' });
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
    <RequireAuthWrapper>
      {({ checkAuth }) => (
        <>
          {children({ download: (e?: any) => checkAuth(handleDownload, e), isDownloading })}
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
      )}
    </RequireAuthWrapper>
  );
};