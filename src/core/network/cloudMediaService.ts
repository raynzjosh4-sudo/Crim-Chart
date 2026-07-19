import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { notificationService } from '../notifications/NotificationService';

const endpoint = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_ENDPOINT || 'https://3d658adeecc895ef7099eec66a501902.r2.cloudflarestorage.com';
const accessKeyId = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME || 'crimchart-media-bucket';

const s3Client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * On iOS, MediaLibrary returns `ph://` URIs and on Android `content://` URIs.
 * `FileSystem.uploadAsync` only handles `file://` paths.
 * This helper copies the asset to a temp file:// location and returns that path.
 * On web or for already-resolved file:// URIs this is a no-op.
 */
async function normalizeNativeUri(uri: string): Promise<string> {
  if (Platform.OS === 'web') return uri;
  if (uri.startsWith('file://')) return uri;

  // ph:// (iOS Photos) or content:// (Android) — copy to cache dir
  try {
    const ext = uri.split('.').pop()?.split('?')[0] || 'tmp';
    const dest = `${FileSystem.cacheDirectory}crimchart_upload_${Date.now()}.${ext}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    console.log(`[CloudMediaService] Normalized ${uri.substring(0, 30)} → ${dest}`);
    return dest;
  } catch (e) {
    console.warn('[CloudMediaService] normalizeNativeUri failed, using original URI:', e);
    return uri;
  }
}


export class CloudMediaService {
  async uploadMedia(
    localUri: string | Blob,
    folderName: string = 'channel_avatars',
    userId?: string,
    taskId?: string
  ): Promise<string> {
    const uriString = localUri instanceof Blob ? '[blob]' : localUri;
    console.log(`☁️ CloudMediaService: Starting upload of ${uriString} to ${folderName}...`);
    
    const notificationId = taskId || `upload_${Date.now()}`;
    const title = folderName === 'channel_avatars' ? 'Creating Channel...' : 'Uploading Media...';
    
    await notificationService.init();
    await notificationService.showUploadProgress(notificationId, 10);

    const id = userId || 'anonymous';
    const timestamp = Date.now();
    
    let extension = '';
    if (localUri instanceof Blob) {
      // Derive extension from MIME type
      const mime = localUri.type || '';
      if (mime.startsWith('audio/')) extension = mime.includes('mpeg') ? 'mp3' : 'm4a';
      else if (mime.startsWith('video/')) extension = 'mp4';
      else if (mime.startsWith('image/png')) extension = 'png';
      else extension = 'jpg';
    } else {
      extension = localUri.split('.').pop() || '';
      if (extension.length > 10 || extension.includes('/') || extension === '') {
        // Fallback for blob: URLs or urls without extension
        if (folderName.includes('audio')) {
          extension = 'mp3';
        } else if (folderName.includes('video') || folderName === 'raw') {
          extension = 'mp4';
        } else {
          extension = 'jpg';
        }
      }
    }
    const rawFileName = `Chart_${timestamp}.${extension}`;
    const objectKey = `users/${id}/${folderName}/${rawFileName}`;

    try {
      let mimeType = 'application/octet-stream';
      if (extension.toLowerCase() === 'json') mimeType = 'application/json';
      else if (['jpg', 'jpeg'].includes(extension.toLowerCase())) mimeType = 'image/jpeg';
      else if (extension.toLowerCase() === 'png') mimeType = 'image/png';
      else if (extension.toLowerCase() === 'mp4') mimeType = 'video/mp4';
      else if (['m4a', 'aac', 'caf'].includes(extension.toLowerCase())) mimeType = 'audio/mp4';
      else if (extension.toLowerCase() === 'mp3') mimeType = 'audio/mpeg';
      // If localUri is a Blob with a known MIME type, prefer that
      else if (localUri instanceof Blob && localUri.type) mimeType = localUri.type;

      await notificationService.showUploadProgress(notificationId, 30);

      // 1. Create a PutObjectCommand (NO Body here, just metadata for the signature)
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: mimeType,
      });

      // 2. Generate a pre-signed URL
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      await notificationService.showUploadProgress(notificationId, 50);

      // 3. Upload directly to the presigned URL
      let uploadSuccessful = false;
      
      if (Platform.OS === 'web') {
        let blob: Blob;
        if (localUri instanceof Blob) {
          // Already pre-read — use directly, no fetch needed
          blob = localUri;
        } else {
          const response = await fetch(localUri);
          blob = await response.blob();
        }
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': mimeType,
          },
        });
        if (!uploadRes.ok) {
          throw new Error(`Cloudflare S3 error: ${uploadRes.status} ${await uploadRes.text()}`);
        }
        uploadSuccessful = true;
      } else {
        // Normalize ph:// / content:// → file:// before uploading on native
        const nativeUri = await normalizeNativeUri(localUri as string);
        const uploadRes = await FileSystem.uploadAsync(signedUrl, nativeUri, {
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            'Content-Type': mimeType,
          },
        });

        if (uploadRes.status < 200 || uploadRes.status >= 300) {
          throw new Error(`Cloudflare S3 error: ${uploadRes.status} ${uploadRes.body}`);
        }
        uploadSuccessful = true;
      }

      // 4. Return the public CDN URL
      const baseUrl = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_PUBLIC_BASE || 'https://cdn.crimchart.com';
      const publicUrl = `${baseUrl}/${objectKey}`;
      console.log(`✅ CloudMediaService: Upload success! URL: ${publicUrl}`);
      
      await notificationService.finishUpload(notificationId);
      return publicUrl;
    } catch (e: any) {
      console.error(`❌ CloudMediaService: Upload FAILED: ${e.message}`);
      await notificationService.finishUpload(notificationId);
      throw e;
    }
  }

  async uploadRawVideoForTranscoding(
    localUri: string,
    videoFilename: string
  ): Promise<string> {
    console.log(`☁️ CloudMediaService: Starting RAW video upload for Coconut: ${videoFilename}`);
    const notificationId = `raw_upload_${Date.now()}`;
    const title = 'Uploading Original Video...';

    await notificationService.init();
    await notificationService.showUploadProgress(notificationId, 10);

    const objectKey = `raw/${videoFilename}`;

    try {
      await notificationService.showUploadProgress(notificationId, 30);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: 'video/mp4',
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      await notificationService.showUploadProgress(notificationId, 50);

      let uploadSuccessful = false;
      
      if (Platform.OS === 'web') {
        const response = await fetch(localUri);
        const blob = await response.blob();
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': 'video/mp4',
          },
        });
        if (!uploadRes.ok) {
          throw new Error(`Cloudflare S3 error: ${uploadRes.status} ${await uploadRes.text()}`);
        }
        uploadSuccessful = true;
      } else {
        const nativeVideoUri = await normalizeNativeUri(localUri);
        const uploadRes = await FileSystem.uploadAsync(signedUrl, nativeVideoUri, {
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            'Content-Type': 'video/mp4',
          },
        });

        if (uploadRes.status < 200 || uploadRes.status >= 300) {
          throw new Error(`Cloudflare S3 error: ${uploadRes.status} ${uploadRes.body}`);
        }
        uploadSuccessful = true;
      }

      const baseUrl = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_PUBLIC_BASE || 'https://cdn.crimchart.com';
      const publicUrl = `${baseUrl}/${objectKey}`;
      console.log(`✅ CloudMediaService: Raw Upload success! URL: ${publicUrl}`);

      await notificationService.finishUpload(notificationId);
      return publicUrl;
    } catch (e: any) {
      console.error(`❌ CloudMediaService: Raw Upload FAILED: ${e.message}`);
      await notificationService.finishUpload(notificationId);
      throw e;
    }
  }
}

export const cloudMediaService = new CloudMediaService();
