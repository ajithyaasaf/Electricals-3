/**
 * Image Service Abstraction Layer
 * 
 * This module provides a provider-agnostic interface for image upload,
 * storage, and transformation operations. Supports easy migration between
 * cloud providers (Cloudinary, Firebase, ImageKit, etc.).
 * 
 * Key Design Principles:
 * - Full metadata tracking (not just URLs)
 * - Provider-specific IDs for deletion & migration
 * - Standardized transformation API
 * - Structured error handling
 */

/**
 * Supported image storage providers
 */
export type ImageProvider = 'cloudinary' | 'firebase' | 'imagekit';

/**
 * Complete metadata for an uploaded image
 * 
 * @property url - Public CDN URL for accessing the image
 * @property provider - Which service is hosting this image
 * @property providerImageId - Provider-specific ID (for deletion/migration)
 * @property width - Image width in pixels
 * @property height - Image height in pixels
 * @property format - Image format (jpg, png, webp, etc.)
 * @property size - File size in bytes
 * @property uploadedAt - Original upload timestamp (preserved during migration)
 */
export interface ImageMetadata {
    url: string;
    provider: ImageProvider;
    providerImageId: string;
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    uploadedAt: Date;
}

/**
 * Provider-agnostic image transformation options
 * These get mapped to provider-specific APIs internally
 */
export interface TransformOptions {
    width?: number;
    height?: number;
    quality?: 'auto' | 'low' | 'medium' | 'high' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Upload configuration options
 */
export interface UploadOptions {
    folder?: string;
    publicId?: string;
    originalUploadedAt?: Date; // For preserving timestamps during migration
}

/**
 * Standardized error codes for image operations
 */
export type ImageServiceErrorCode =
    | 'UPLOAD_FAILED'
    | 'DELETE_FAILED'
    | 'INVALID_FILE'
    | 'QUOTA_EXCEEDED'
    | 'PROVIDER_ERROR'
    | 'NETWORK_ERROR';

/**
 * Structured error for image service operations
 */
export class ImageServiceError extends Error {
    constructor(
        public code: ImageServiceErrorCode,
        message: string,
        public provider: ImageProvider,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'ImageServiceError';
    }
}

/**
 * Core image service interface
 * All providers must implement this contract
 */
export interface IImageService {
    /**
     * Upload an image to the provider
     * 
     * @param buffer - Image file buffer
     * @param options - Upload configuration
     * @returns Complete image metadata
     * @throws ImageServiceError if upload fails
     */
    uploadImage(buffer: Buffer, options?: UploadOptions): Promise<ImageMetadata>;

    /**
     * Delete an image from the provider
     * 
     * @param providerImageId - Provider-specific image ID
     * @throws ImageServiceError if deletion fails
     */
    deleteImage(providerImageId: string): Promise<void>;

    /**
     * Generate optimized image URL with transformations
     * 
     * @param providerImageId - Provider-specific image ID
     * @param transform - Transformation options
     * @returns Optimized image URL
     */
    getImageUrl(providerImageId: string, transform?: TransformOptions): string;

    /**
     * Get provider name
     */
    getProviderName(): ImageProvider;
}
