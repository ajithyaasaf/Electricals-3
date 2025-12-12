import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
    publicId: string;
    url: string;
    secureUrl: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}

/**
 * Upload image to Cloudinary with auto-optimization
 * @param file - File buffer from multer
 * @param options - Upload configuration
 * @returns Upload result with URLs and metadata
 */
export async function uploadImage(
    file: Buffer,
    options: {
        folder?: string;
        publicId?: string;
        transformation?: any;
    } = {}
): Promise<CloudinaryUploadResult> {
    try {
        const uploadOptions: any = {
            folder: options.folder || process.env.CLOUDINARY_UPLOAD_FOLDER || 'products',
            resource_type: 'image',
            // Auto-optimize for web delivery
            transformation: options.transformation || [
                { quality: 'auto', fetch_format: 'auto' }, // Auto WebP/AVIF
                { width: 2000, height: 2000, crop: 'limit' }, // Max dimensions
            ],
        };

        if (options.publicId) {
            uploadOptions.public_id = options.publicId;
        }

        // Upload as base64 data URI
        const dataUri = `data:image/png;base64,${file.toString('base64')}`;
        const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

        return {
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        };
    } catch (error) {
        console.error('[Cloudinary] Upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteImage(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
        console.log('[Cloudinary] Image deleted:', publicId);
    } catch (error) {
        console.error('[Cloudinary] Delete error:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
}

/**
 * Generate responsive image URL with transformations
 * @param publicId - Cloudinary public ID
 * @param width - Target width
 * @param quality - Image quality (auto or 1-100)
 */
export function getResponsiveImageUrl(
    publicId: string,
    width: number,
    quality: 'auto' | number = 'auto'
): string {
    return cloudinary.url(publicId, {
        width,
        quality,
        fetch_format: 'auto',
        crop: 'limit',
    });
}

export default cloudinary;
