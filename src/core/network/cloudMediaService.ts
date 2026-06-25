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

export class CloudMediaService {
  async uploadMedia(
    localUri: string,
    folderName: string = 'channel_avatars',
    userId?: string,
    taskId?: string
  ): Promise<string> {
    console.log(`☁️ CloudMediaService: Starting upload of ${localUri} to ${folderName}...`);
    
    const notificationId = taskId || `upload_${Date.now()}`;
    const title = folderName === 'channel_avatars' ? 'Creating Channel...' : 'Uploading Media...';
    
    await notificationService.init();
    await notificationService.showUploadProgress(notificationId, title, 10);

    const id = userId || 'anonymous';
    const timestamp = Date.now();
    
    const extension = localUri.split('.').pop() || 'jpg';
    const rawFileName = `Chart_${timestamp}.${extension}`;
    const objectKey = `users/${id}/${folderName}/${rawFileName}`;

    try {
      let mimeType = 'application/octet-stream';
      if (localUri.toLowerCase().endsWith('.json')) mimeType = 'application/json';
      else if (['jpg', 'jpeg'].includes(extension.toLowerCase())) mimeType = 'image/jpeg';
      else if (extension.toLowerCase() === 'png') mimeType = 'image/png';
      else if (extension.toLowerCase() === 'mp4') mimeType = 'video/mp4';
      else if (['m4a', 'aac', 'caf'].includes(extension.toLowerCase())) mimeType = 'audio/mp4';

      await notificationService.showUploadProgress(notificationId, title, 30);

      // 1. Create a PutObjectCommand (NO Body here, just metadata for the signature)
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: mimeType,
      });

      // 2. Generate a pre-signed URL
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      await notificationService.showUploadProgress(notificationId, title, 50);

      // 3. Upload directly to the presigned URL
      let uploadSuccessful = false;
      
      if (Platform.OS === 'web') {
        const response = await fetch(localUri);
        const blob = await response.blob();
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
        const uploadRes = await FileSystem.uploadAsync(signedUrl, localUri, {
          httpMethod: 'PUT',
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
      
      await notificationService.finishUpload(notificationId, title);
      return publicUrl;
    } catch (e: any) {
      console.error(`❌ CloudMediaService: Upload FAILED: ${e.message}`);
      await notificationService.finishUpload(notificationId, title);
      throw e;
    }
  }

  async uploadRawVideoForCoconut(
    localUri: string,
    videoFilename: string
  ): Promise<string> {
    console.log(`☁️ CloudMediaService: Starting RAW video upload for Coconut: ${videoFilename}`);
    const notificationId = `raw_upload_${Date.now()}`;
    const title = 'Uploading Original Video...';

    await notificationService.init();
    await notificationService.showUploadProgress(notificationId, title, 10);

    const objectKey = `raw/${videoFilename}`;

    try {
      await notificationService.showUploadProgress(notificationId, title, 30);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: 'video/mp4',
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      await notificationService.showUploadProgress(notificationId, title, 50);

      const uploadRes = await FileSystem.uploadAsync(signedUrl, localUri, {
        httpMethod: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
        },
      });

      if (uploadRes.status < 200 || uploadRes.status >= 300) {
        throw new Error(`Cloudflare S3 error: ${uploadRes.status} ${uploadRes.body}`);
      }

      const baseUrl = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_PUBLIC_BASE || 'https://cdn.crimchart.com';
      const publicUrl = `${baseUrl}/${objectKey}`;
      console.log(`✅ CloudMediaService: Raw Upload success! URL: ${publicUrl}`);

      await notificationService.finishUpload(notificationId, title);
      return publicUrl;
    } catch (e: any) {
      console.error(`❌ CloudMediaService: Raw Upload FAILED: ${e.message}`);
      await notificationService.finishUpload(notificationId, title);
      throw e;
    }
  }
}

export const cloudMediaService = new CloudMediaService();
