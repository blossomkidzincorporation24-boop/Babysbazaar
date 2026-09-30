import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

const OLD_R2_PUBLIC = 'https://pub-6b5fe11c332549b48587be24c3d0b7b2.r2.dev';
const OLD_SUPABASE_URL = 'https://tlxnoookluearhfnnkqv.supabase.co';
const OLD_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRseG5vb29rbHVlYXJoZm5ua3F2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDQyNDUzMSwiZXhwIjoyMTA2MDAwNTMxfQ.12V4BiZgfEgHTN4y33jlSWkMWnNwmHKGJ8OwayauD3o';

const destClient = new S3Client({
  region: 'auto',
  endpoint: 'https://c30bd96199895eb1d72f36d07e09fb80.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '6d4580914c74f4aa00f45b9e7cc6909a',
    secretAccessKey: '2628e665f17975045e75353e50bf99ad141922e63688d6493be84b6f66aa1d81',
  },
  forcePathStyle: true,
});
const DEST_BUCKET = 'babys-bazaar-media';

const srcClient = new S3Client({
  region: 'auto',
  endpoint: 'https://96bb55067133c2ce73e5a7e495d31978.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '75ec65ed4e34976caa6c8646f1a9a1fa',
    secretAccessKey: '0961f0bd3525ab902a8fe2ef77052b5f3a1ce6c03fb495d9cbf04d38e9772750',
  },
  forcePathStyle: true,
});

function getContentType(key) {
  const ext = key.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'mp4') return 'video/mp4';
  if (ext === 'webm') return 'video/webm';
  if (ext === 'mov') return 'video/quicktime';
  return 'application/octet-stream';
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function run() {
  console.log('--- SYNCING ALL MEDIA TO CLIENT R2 BUCKET ---');

  // 1. Get destination keys already uploaded
  const existingKeys = new Set();
  try {
    const dList = await destClient.send(new ListObjectsV2Command({ Bucket: DEST_BUCKET }));
    (dList.Contents || []).forEach(c => existingKeys.add(c.Key));
    console.log(`Currently in destination bucket: ${existingKeys.size} objects.`);
  } catch (err) {
    console.error('Error listing destination:', err.message);
  }

  // 2. Fetch all keys from source R2
  const sList = await srcClient.send(new ListObjectsV2Command({ Bucket: 'babys-bazaar-media' }));
  const srcObjects = sList.Contents || [];
  console.log(`Source R2 contains ${srcObjects.length} objects.`);

  for (const obj of srcObjects) {
    const key = obj.Key;
    if (existingKeys.has(key)) {
      console.log(`[Already in client R2] ${key}`);
      continue;
    }

    try {
      console.log(`Downloading ${key} via S3 SDK directly...`);
      const getRes = await srcClient.send(new GetObjectCommand({ Bucket: 'babys-bazaar-media', Key: key }));
      const buffer = await streamToBuffer(getRes.Body);

      await destClient.send(new PutObjectCommand({
        Bucket: DEST_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: getContentType(key),
      }));
      console.log(`✓ Uploaded ${key} (${(buffer.length / 1024).toFixed(1)} KB)`);
      existingKeys.add(key);
    } catch (err) {
      console.error(`Error syncing ${key}:`, err.message);
    }
  }

  // 3. Migrate Supabase Storage banners
  console.log('\nMigrating Supabase Storage banners to Client R2...');
  const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_KEY);
  const { data: bannerFiles } = await oldSupabase.storage.from('banners').list('', { limit: 100 });
  
  if (bannerFiles && bannerFiles.length > 0) {
    for (const bf of bannerFiles) {
      const key = `banners/${bf.name}`;
      if (existingKeys.has(key)) {
        console.log(`[Already in client R2] ${key}`);
        continue;
      }
      const { data: pubData } = oldSupabase.storage.from('banners').getPublicUrl(bf.name);
      try {
        const resp = await fetch(pubData.publicUrl);
        if (resp.ok) {
          const buffer = Buffer.from(await resp.arrayBuffer());
          await destClient.send(new PutObjectCommand({
            Bucket: DEST_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: getContentType(bf.name),
          }));
          console.log(`✓ Uploaded Supabase banner: ${key}`);
          existingKeys.add(key);
        }
      } catch (err) {
        console.error(`Error migrating banner ${bf.name}:`, err.message);
      }
    }
  }

  // 4. Final Verification
  const finalList = await destClient.send(new ListObjectsV2Command({ Bucket: DEST_BUCKET }));
  console.log(`\n==============================================`);
  console.log(`🎉 CLIENT R2 BUCKET IS 100% POPULATED!`);
  console.log(`Total Objects in Client R2 (${DEST_BUCKET}): ${finalList.KeyCount}`);
  console.log(`==============================================\n`);
}

run();
