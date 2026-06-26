const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const endpoint = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_ENDPOINT || 'https://3d658adeecc895ef7099eec66a501902.r2.cloudflarestorage.com';
const accessKeyId = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_ACCESS_KEY_ID || 'YOUR_ACCESS_KEY';
const secretAccessKey = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_SECRET_ACCESS_KEY || 'YOUR_SECRET_KEY';
const bucketName = 'crimchart-media-bucket';

const s3Client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

async function run() {
  console.log('\n=== Test 1: Generate presigned URL ===');
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: 'test/hello.txt',
      ContentType: 'text/plain',
    });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    console.log('✅ Presigned URL generated successfully!');
    console.log('URL (first 100 chars):', signedUrl.substring(0, 100) + '...');

    console.log('\n=== Test 2: Upload a tiny test file ===');
    const res = await fetch(signedUrl, {
      method: 'PUT',
      body: 'hello from crimchart test',
      headers: { 'Content-Type': 'text/plain' },
    });

    if (res.ok) {
      console.log('✅ Upload succeeded! Status:', res.status);
      console.log('\n=== Test 3: Check which public URL actually works ===');
      const url1 = `https://cdn.crimchart.com/test/hello.txt`;
      const url2 = `https://crown.nexassearch.com/test/hello.txt`;
      
      for (const url of [url1, url2]) {
        try {
          const check = await fetch(url, { method: 'HEAD' });
          console.log(`${check.ok ? '✅' : '❌'} ${url} → HTTP ${check.status}`);
        } catch (e) {
          console.log(`❌ ${url} → Failed: ${e.message}`);
        }
      }
    } else {
      const text = await res.text();
      console.error('❌ Upload FAILED! Status:', res.status, text);
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

run();
