import { AwsClient } from 'aws4fetch';
import { notificationService } from '../notifications/NotificationService';

const endpoint = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_ENDPOINT || 'https://3d658adeecc895ef7099eec66a501902.r2.cloudflarestorage.com';
const accessKeyId = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME || 'crown-media-bucket';

const aws = new AwsClient({
  accessKeyId,
  secretAccessKey,
  service: 's3',
  region: 'auto',
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
      // 1. Load the local file bytes
      const response = await fetch(localUri);
      const blob = await response.blob();
      
      let mimeType = 'application/octet-stream';
      if (localUri.toLowerCase().endsWith('.json')) mimeType = 'application/json';
      else if (['jpg', 'jpeg'].includes(extension.toLowerCase())) mimeType = 'image/jpeg';
      else if (extension.toLowerCase() === 'png') mimeType = 'image/png';
      else if (extension.toLowerCase() === 'mp4') mimeType = 'video/mp4';

      await notificationService.showUploadProgress(notificationId, title, 50);

      // 2. Build the exact Cloudflare R2 bucket endpoint
      const url = new URL(`${endpoint}/${bucketName}/${objectKey}`);

      // 3. Upload using AWS Signature V4 via aws4fetch
      const uploadRes = await aws.fetch(url.toString(), {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': mimeType,
        },
      });

      if (!uploadRes.ok) {
        throw new Error(`Cloudflare S3 error: ${uploadRes.status} ${uploadRes.statusText}`);
      }

      // 4. Return the public CDN URL
      const publicUrl = `https://crown.nexassearch.com/${objectKey}`;
      console.log(`✅ CloudMediaService: Upload success! URL: ${publicUrl}`);
      
      await notificationService.finishUpload(notificationId, title);
      return publicUrl;
    } catch (e: any) {
      console.error(`❌ CloudMediaService: Upload FAILED: ${e.message}`);
      await notificationService.finishUpload(notificationId, title);
      throw e;
    }
  }
}

export const cloudMediaService = new CloudMediaService();
