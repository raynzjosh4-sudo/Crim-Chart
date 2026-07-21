const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

// Manually parse .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const BUCKET_NAME = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_BUCKET_NAME;
const PUBLIC_BASE = process.env.EXPO_PUBLIC_CLOUDFLARE_R2_PUBLIC_BASE || 'https://cdn.crimchart.com';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.EXPO_PUBLIC_CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.EXPO_PUBLIC_CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
};

async function uploadFile(filePath, keyPrefix) {
  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath);
  const mimeType = getMimeType(filePath);
  
  // Use a hash to prevent overwriting and handle spaces/special chars
  const hash = crypto.createHash('md5').update(fileName + Date.now()).digest('hex').substring(0, 8);
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const objectKey = `${keyPrefix}/${hash}_${safeName}`;

  console.log(`Uploading ${fileName} to ${objectKey}...`);
  
  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: fileContent,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000',
    }));
    
    return `${PUBLIC_BASE}/${objectKey}`;
  } catch (err) {
    console.error(`Failed to upload ${fileName}:`, err);
    return null;
  }
}

async function main() {
  const targetDirs = [
    path.resolve(__dirname, '../assets/searchingineimages'),
    path.resolve(__dirname, '../assets/appicon')
  ];
  
  const sqlStatements = [];
  sqlStatements.push('-- Auto-generated insert script for SEO assets');
  
  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
      console.warn(`Directory not found: ${dir}`);
      continue;
    }
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) continue;
        
        const url = await uploadFile(filePath, 'seo_assets');
        if (url) {
          const sql = `INSERT INTO public.public_assets (filename, url, type) VALUES ('${file.replace(/'/g, "''")}', '${url}', 'image');`;
          sqlStatements.push(sql);
        }
      }
    }
  }
  
  const sqlOutput = sqlStatements.join('\n');
  const outputPath = path.resolve(__dirname, '../insert_public_assets.sql');
  fs.writeFileSync(outputPath, sqlOutput);
  console.log(`\n✅ Upload complete! Wrote SQL insert script to ${outputPath}`);
  console.log(`You can now run 'insert_public_assets.sql' in your Supabase SQL Editor.`);
}

main().catch(console.error);
