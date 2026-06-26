// import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
// import fs from 'fs';
// import path from 'path';

// // Parse .env manually
// const envPath = path.resolve(process.cwd(), '.env');
// if (fs.existsSync(envPath)) {
//   const content = fs.readFileSync(envPath, 'utf8');
//   content.split('\n').forEach(line => {
//     const match = line.match(/^([^=]+)=(.*)$/);
//     if (match) {
//       const key = match[1].trim();
//       const value = match[2].trim();
//       if (!process.env[key]) {
//         process.env[key] = value;
//       }
//     }
//   });
// }

// const endpoint = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_ENDPOINT || 'https://3d658adeecc895ef7099eec66a501902.r2.cloudflarestorage.com';
// const accessKeyId = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_ACCESS_KEY_ID || '';
// const secretAccessKey = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
// const bucketName = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME || 'crimchart-media-bucket';

// const s3Client = new S3Client({
//   region: 'auto',
//   endpoint,
//   credentials: {
//     accessKeyId,
//     secretAccessKey,
//   },
// });

// async function main() {
//   try {
//     console.log('Configuring CORS for bucket:', bucketName);
//     const command = new PutBucketCorsCommand({
//       Bucket: bucketName,
//       CORSConfiguration: {
//         CORSRules: [
//           {
//             AllowedHeaders: ['*'],
//             AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
//             AllowedOrigins: ['*'],
//             ExposeHeaders: ['ETag'],
//             MaxAgeSeconds: 3000,
//           },
//         ],
//       },
//     });

//     await s3Client.send(command);
//     console.log('CORS configured successfully!');
//   } catch (err) {
//     console.error('Error configuring CORS:', err);
//   }
// }

// main();
