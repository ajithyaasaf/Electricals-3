import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import {
    IImageService,
    ImageMetadata,
    ImageProvider,
    ImageServiceError,
    TransformOptions,
    UploadOptions,
} from '../image-service.interface';

/**
 * Firebase Storage implementation of the image service
 * 
 * Strategy: Pre-generated variants (not on-demand Cloud Functions)
 * 
 * Features:
 * - Public URLs (not signed URLs - no expiration)
 * - Pre-generated image variants for fast delivery
 * - Lower cost (pay-per-storage, not per-request)
 * - Simple deployment (no Cloud Functions needed)
 * 
 * Variants Generated:
 * - thumbnail: 150x150
 * - small: 400x400
 * - medium: 800x800
 * - large: 1200x1200 
 * - original: full size
 */
export class FirebaseProvider implements IImageService {
    private readonly provider: ImageProvider = 'firebase';
    private storage: Storage;
    private bucket: any;
    private bucketName: string;

    constructor() {
        // Initialize Firebase Storage
        this.storage = new Storage({
            projectId: process.env.FIREBASE_PROJECT_ID,
            credentials: process.env.FIREBASE_SERVICE_ACCOUNT
                ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
                : undefined,
        });

        this.bucketName = process.env.FIREBASE_STORAGE_BUCKET || '';
        if (!this.bucketName) {
            throw new Error('Firebase Storage bucket not configured');
        }

        this.bucket = this.storage.bucket(this.bucketName);
    }

    /**
     * Upload image with pre-generated variants
     */
    async uploadImage(buffer: Buffer, options: UploadOptions = {}): Promise<ImageMetadata> {
        try {
            const folder = options.folder || 'products';
            const imageId = options.publicId || uuidv4();

            // Get image metadata
            const metadata = await sharp(buffer).metadata();
            const format = metadata.format || 'jpg';

            // Upload original
            const originalPath = `${folder}/${imageId}/original.${format}`;
            await this.uploadFile(buffer, originalPath, metadata.format!);

            // Generate and upload variants
            await this.generateVariants(buffer, folder, imageId, format);

            // Generate public URL
            const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${originalPath}`;

            console.log('[Firebase] Image uploaded successfully:', originalPath);

            return {
                url: publicUrl,
                provider: this.provider,
                providerImageId: `${folder}/${imageId}`,  // Base path for all variants
                width: metadata.width,
                height: metadata.height,
                format: format,
                size: buffer.length,
                uploadedAt: options.originalUploadedAt || new Date(),
            };
        } catch (error) {
            console.error('[Firebase] Upload error:', error);
            throw this.handleError(error, 'UPLOAD_FAILED', 'Failed to upload image to Firebase Storage');
        }
    }

    /**
     * Generate and upload image variants
     */
    private async generateVariants(
        buffer: Buffer,
        folder: string,
        imageId: string,
        format: string
    ): Promise<void> {
        const variants = [
            { name: 'thumbnail', size: 150 },
            { name: 'small', size: 400 },
            { name: 'medium', size: 800 },
            { name: 'large', size: 1200 },
        ];

        const uploadPromises = variants.map(async (variant) => {
            const resized = await sharp(buffer)
                .resize(variant.size, variant.size, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

            const path = `${folder}/${imageId}/${variant.name}.webp`;
            await this.uploadFile(resized, path, 'webp');
        });

        await Promise.all(uploadPromises);
    }

    /**
     * Upload a file to Firebase Storage
     */
    private async uploadFile(buffer: Buffer, path: string, format: string): Promise<void> {
        const file = this.bucket.file(path);

        await file.save(buffer, {
            metadata: {
                contentType: `image/${format}`,
            },
            public: true,  // Make publicly accessible (no signed URL needed)
        });
    }

    /**
     * Delete image and all its variants
     */
    async deleteImage(providerImageId: string): Promise<void> {
        try {
            // Delete entire folder (original + all variants)
            const [files] = await this.bucket.getFiles({ prefix: providerImageId });

            const deletePromises = files.map((file: any) => file.delete());
            await Promise.all(deletePromises);

            console.log('[Firebase] Image deleted:', providerImageId);
        } catch (error) {
            console.error('[Firebase] Delete error:', error);
            throw this.handleError(error, 'DELETE_FAILED', `Failed to delete image: ${providerImageId}`);
        }
    }

    /**
     * Get URL for appropriate variant
     */
    getImageUrl(providerImageId: string, transform?: TransformOptions): string {
        if (!transform || (!transform.width && !transform.height)) {
            // Return original
            return `https://storage.googleapis.com/${this.bucketName}/${providerImageId}/original.jpg`;
        }

        // Select appropriate variant based on requested size
        const variant = this.selectVariant(transform.width, transform.height);
        return `https://storage.googleapis.com/${this.bucketName}/${providerImageId}/${variant}.webp`;
    }

    /**
     * Select appropriate pre-generated variant
     */
    private selectVariant(width?: number, height?: number): string {
        const size = Math.max(width || 0, height || 0);

        if (size <= 150) return 'thumbnail';
        if (size <= 400) return 'small';
        if (size <= 800) return 'medium';
        if (size <= 1200) return 'large';
        return 'original';
    }

    /**
     * Get provider name
     */
    getProviderName(): ImageProvider {
        return this.provider;
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

// Export singleton instance (dormant until configured)
export const firebaseProvider = new FirebaseProvider();
