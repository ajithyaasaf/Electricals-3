import { IImageService, ImageProvider } from './image-service.interface';
import { getCloudinaryProvider } from './providers/cloudinary-provider';
// Firebase provider is dormant until configured
// import { getFirebaseProvider } from './providers/firebase-provider';

/**
 * Image service factory
 * 
 * Returns the appropriate image service provider based on configuration.
 * To switch providers, update the IMAGE_PROVIDER environment variable.
 * 
 * Supported providers:
 * - 'cloudinary' (default)
 * - 'firebase' (requires Firebase configuration)
 * - 'imagekit' (future)
 */

/**
 * Get the active image service provider
 * 
 * @returns Configured image service instance
 * @throws Error if provider is not configured
 */
export function getImageService(): IImageService {
    const provider = (process.env.IMAGE_PROVIDER || 'cloudinary') as ImageProvider;

    switch (provider) {
        case 'cloudinary':
            return getCloudinaryProvider();

        case 'firebase':
            // Uncomment when ready to use Firebase
            // return firebaseProvider;
            throw new Error('Firebase provider is not yet activated. Configure Firebase credentials first.');

        case 'imagekit':
            throw new Error('ImageKit provider not implemented yet');

        default:
            // Fallback to Cloudinary
            console.warn(`Unknown provider "${provider}", falling back to Cloudinary`);
            return getCloudinaryProvider();
    }
}

/**
 * Get a specific provider by name
 * Useful for migration scripts
 */
export function getProviderByName(providerName: ImageProvider): IImageService {
    const previousProvider = process.env.IMAGE_PROVIDER;

    try {
        // Temporarily override provider
        process.env.IMAGE_PROVIDER = providerName;
        return getImageService();
    } finally {
        // Restore previous provider
        if (previousProvider) {
            process.env.IMAGE_PROVIDER = previousProvider;
        } else {
            delete process.env.IMAGE_PROVIDER;
        }
    }
}
