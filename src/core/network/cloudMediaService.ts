import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { notificationService } from '../notifications/NotificationService';

const endpoint = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_ENDPOINT || 'https://3d658adeecc895ef7099eec66a501902.r2.cloudflarestorage.com';
const accessKeyId = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME || 'crown-media-bucket';

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

      // 3. Load the local file bytes natively
      const response = await fetch(localUri);
      const blob = await response.blob();
      
      await notificationService.showUploadProgress(notificationId, title, 70);

      // 4. Upload directly to the presigned URL using standard fetch
      const uploadRes = await fetch(signedUrl, {
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
