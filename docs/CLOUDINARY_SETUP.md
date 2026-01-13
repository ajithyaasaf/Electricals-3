# Cloudinary Setup Guide

## Quick Start (5 Minutes)

### Step 1: Create Free Cloudinary Account

1. Go to: https://cloudinary.com/users/register_free
2. Sign up with email (free tier = 25GB storage + 25GB bandwidth/month)
3. Verify your email

### Step 2: Get Your Credentials

1. Login to Cloudinary Console: https://cloudinary.com/console
2. You'll see your credentials on the Dashboard:
   - **Cloud Name** (e.g., `dxxxxx123`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click "Show" to reveal)

### Step 3: Add to `.env` File

Open your `.env` file and add these lines (replace with your actual credentials):

```env
# Image Storage Configuration
IMAGE_PROVIDER=cloudinary

CLOUDINARY_CLOUD_NAME=dxxxxx123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_secret_key_here
CLOUDINARY_UPLOAD_FOLDER=electrical-products
```

###  Step 4: Restart Your Server

```bash
npm run dev
```

That's it! Image uploads will now work in the admin panel.

---

## What Cloudinary Free Tier Includes

✅ **Storage**: 25 GB  
✅ **Bandwidth**: 25 GB/month  
✅ **Transformations**: 25,000/month  
✅ **CDN**: Worldwide delivery  

**For 1000 products with 3-5 images each:**
- Storage needed: ~2-3 GB ✅ (well within free tier)
- You're covered for 12-18 months before needing to upgrade

---

## Security Notes

⚠️ **Never commit `.env` file to Git** (it's already in `.gitignore`)  
⚠️ **Never share your API Secret publicly**  
✅ The `.env.example` file is safe to commit (no real credentials)

---

## Troubleshooting

**Error: "Cloudinary credentials not configured"**
- Make sure you added all 4 Cloudinary variables to `.env`
- Restart your server after adding credentials
- Verify there are no typos in variable names

**Error: "Invalid credentials"**
- Double-check you copied the correct values from Cloudinary Console
- Make sure there are no extra spaces in the `.env` file
- API Secret should NOT include quotes

**Images not uploading:**
- Check browser console for error messages
- Verify you're logged in as admin
- Check server logs for detailed error info

---

## Migration Path (Future)

When you approach Cloudinary's free tier limits:

1. **Firebase Storage** (~$5-15/month for 1000 products)
2. **ImageKit** ($49/month - better than Cloudinary's $89)
3. **Continue with Cloudinary** ($89/month if you have revenue)

The migration is already built-in - just change `IMAGE_PROVIDER` in `.env` and run the migration script!
