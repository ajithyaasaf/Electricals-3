import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import {
    IImageService,
    ImageMetadata,
    ImageProvider,
    ImageServiceError,
    TransformOptions,
    UploadOptions,
} from '../image-service.interface';

/**
 * Cloudinary implementation of the image service
 * 
 * Features:
 * - Auto-optimization (WebP/AVIF conversion)
 * - Built-in CDN
 * - On-demand transformations
 * - Comprehensive error handling
 */
export class CloudinaryProvider implements IImageService {
    private readonly provider: ImageProvider = 'cloudinary';

    constructor() {
        // Ensure Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET) {
            throw new Error('Cloudinary credentials not configured. Check environment variables.');
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    /**
     * Upload image to Cloudinary with full metadata tracking
     */
    async uploadImage(buffer: Buffer, options: UploadOptions = {}): Promise<ImageMetadata> {
        try {
            const uploadOptions: any = {
                folder: options.folder || process.env.CLOUDINARY_UPLOAD_FOLDER || 'products',
                resource_type: 'image',
                // Auto-optimize for web delivery
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' }, // Auto WebP/AVIF
                    { width: 2000, height: 2000, crop: 'limit' }, // Max dimensions
                ],
            };

            if (options.publicId) {
                uploadOptions.public_id = options.publicId;
            }

            // Upload as base64 data URI
            const dataUri = `data:image/png;base64,${buffer.toString('base64')}`;
            const result: UploadApiResponse = await cloudinary.uploader.upload(dataUri, uploadOptions);

            console.log('[Cloudinary] Image uploaded successfully:', result.public_id);

            return {
                url: result.secure_url,
                provider: this.provider,
                providerImageId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                size: result.bytes,
                // Preserve original timestamp during migration, or use current time
                uploadedAt: options.originalUploadedAt || new Date(),
            };
        } catch (error) {
            console.error('[Cloudinary] Upload error:', error);
            throw this.handleError(error, 'UPLOAD_FAILED', 'Failed to upload image to Cloudinary');
        }
    }

    /**
     * Delete image from Cloudinary
     */
    async deleteImage(providerImageId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(providerImageId);
            console.log('[Cloudinary] Image deleted:', providerImageId);
        } catch (error) {
            console.error('[Cloudinary] Delete error:', error);
            throw this.handleError(error, 'DELETE_FAILED', `Failed to delete image: ${providerImageId}`);
        }
    }

    /**
     * Generate optimized image URL with transformations
     * Maps provider-agnostic transform options to Cloudinary syntax
     */
    getImageUrl(providerImageId: string, transform?: TransformOptions): string {
        if (!transform) {
            return cloudinary.url(providerImageId, { secure: true });
        }

        const cloudinaryTransform = this.mapTransformOptions(transform);
        return cloudinary.url(providerImageId, {
            ...cloudinaryTransform,
            secure: true,
        });
    }

    /**
     * Get provider name
     */
    getProviderName(): ImageProvider {
        return this.provider;
    }

    /**
     * Map provider-agnostic transform options to Cloudinary-specific syntax
     */
    private mapTransformOptions(opts: TransformOptions): any {
        const transform: any = {};

        if (opts.width) {
            transform.width = opts.width;
        }

        if (opts.height) {
            transform.height = opts.height;
        }

        // Map fit modes to Cloudinary crop modes
        if (opts.fit) {
            switch (opts.fit) {
                case 'cover':
                    transform.crop = 'fill';
                    break;
                case 'contain':
                    transform.crop = 'fit';
                    break;
                case 'fill':
                    transform.crop = 'scale';
                    break;
                case 'inside':
                    transform.crop = 'limit';
                    break;
                case 'outside':
                    transform.crop = 'mfit';
                    break;
                default:
                    transform.crop = 'limit';
            }
        }

        // Map quality
        if (opts.quality) {
            transform.quality = opts.quality;
        }

        // Map format
        if (opts.format) {
            transform.fetch_format = opts.format === 'auto' ? 'auto' : opts.format;
        }

        return transform;
    }

    /**
     * Convert generic errors to structured ImageServiceError
     */
    private handleError(error: any, code: 'UPLOAD_FAILED' | 'DELETE_FAILED', message: string): ImageServiceError {
        const originalError = error instanceof Error ? error : new Error(String(error));

        return new ImageServiceError(
            code,
            message,
            this.provider,
            originalError
        );
    }
}

// Lazy-loaded singleton instance
let instance: CloudinaryProvider | null = null;

export function getCloudinaryProvider(): CloudinaryProvider {
    if (!instance) {
        instance = new CloudinaryProvider();
    }
    return instance;
}
