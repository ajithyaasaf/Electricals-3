import { v2 as cloudinary } from 'cloudinary';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Configure Cloudinary with the new account
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('☁️  Connected to Cloudinary Cloud:', process.env.CLOUDINARY_CLOUD_NAME);

// 2. Configure Firebase Admin
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
    });
  } else {
    const keyFile = path.resolve(rootDir, 'server/firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(fs.readFileSync(keyFile, 'utf8'))),
    });
  }
}

const db = admin.firestore();

// Upload cache to prevent re-uploading identical files
const localUploadCache = new Map();

async function uploadLocalOrRemote(imagePath, targetFolder) {
  // If already uploaded in this run
  if (localUploadCache.has(imagePath)) {
    return localUploadCache.get(imagePath);
  }

  // Case 1: Remote URL (from old Cloudinary or external)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log(`   ⬆️  Uploading remote image to Cloudinary [${targetFolder}]...`);
    const res = await cloudinary.uploader.upload(imagePath, {
      folder: targetFolder,
      resource_type: 'image',
    });
    localUploadCache.set(imagePath, res.secure_url);
    return res.secure_url;
  }

  // Case 2: Local static path (e.g. /products/sturlite-street-50w.jpg)
  const cleanPath = imagePath.replace(/^\//, ''); // remove leading slash
  const fullLocalPath = path.resolve(rootDir, 'client/public', cleanPath);

  if (!fs.existsSync(fullLocalPath)) {
    console.warn(`   ⚠️  Local file not found at: ${fullLocalPath}`);
    return imagePath; // Keep as-is if missing
  }

  console.log(`   ⬆️  Uploading local file "${cleanPath}" to Cloudinary [${targetFolder}]...`);
  const res = await cloudinary.uploader.upload(fullLocalPath, {
    folder: targetFolder,
    resource_type: 'image',
  });

  localUploadCache.set(imagePath, res.secure_url);
  return res.secure_url;
}

async function runMigration() {
  console.log('\n🚀 Starting Cloudinary Media Migration...');
  const targetFolder = 'copperbear/products/main';

  const snapshot = await db.collection('products').get();
  console.log(`📦 Found ${snapshot.size} products in Firestore to process.\n`);

  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const product = doc.data();
    const oldImageUrls = product.imageUrls || [];
    
    if (oldImageUrls.length === 0) {
      console.log(`⏩ [${product.name}] (ID: ${doc.id}) - No images to migrate.`);
      continue;
    }

    console.log(`🔄 Processing [${product.name}] (ID: ${doc.id}) with ${oldImageUrls.length} image(s)...`);
    
    const newImageUrls = [];
    let hasChanges = false;

    for (const url of oldImageUrls) {
      // If already on the new Cloudinary cloud name, skip
      if (url.includes(`res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`)) {
        console.log(`   ✅ Already hosted on new Cloudinary: ${url}`);
        newImageUrls.push(url);
        continue;
      }

      try {
        const newUrl = await uploadLocalOrRemote(url, targetFolder);
        newImageUrls.push(newUrl);
        if (newUrl !== url) hasChanges = true;
      } catch (err) {
        console.error(`   ❌ Failed to upload image "${url}":`, err.message);
        newImageUrls.push(url); // keep old URL on error
      }
    }

    if (hasChanges) {
      await db.collection('products').doc(doc.id).update({
        imageUrls: newImageUrls,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      updatedCount++;
      console.log(`   ✨ Updated Firestore document for "${product.name}"\n`);
    } else {
      console.log(`   👌 No changes needed for "${product.name}"\n`);
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🎉 Migration Completed Successfully!`);
  console.log(`📊 Products updated: ${updatedCount} / ${snapshot.size}`);
  console.log(`📁 Cloudinary Folder: ${targetFolder}`);
  console.log('═══════════════════════════════════════════════════════════');
}

runMigration().catch(err => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
