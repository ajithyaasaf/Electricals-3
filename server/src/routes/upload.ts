import type { Express } from "express";
import multer from "multer";
import { isAuthenticated } from "../../firebaseAuth";
import { getImageService } from "../lib/image-service-factory";
import { storage } from "../../storage";

// Configure multer for memory storage (no disk writes)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 10, // Max 10 files per request
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'));
        }
    },
});

// Custom error handler for better user feedback
function handleMulterError(err: any, req: any, res: any, next: any) {
    if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Image is too large. Maximum file size is 5 MB. Please compress your image or choose a smaller file.',
                error: {
                    code: 'FILE_TOO_LARGE',
                    maxSize: '5 MB',
                }
            });
        }
        if (err.message === 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.') {
            return res.status(400).json({
                success: false,
                message: err.message,
                error: {
                    code: 'INVALID_FILE_TYPE',
                }
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload failed',
        });
    }
    next();
}


export function registerUploadRoutes(app: Express) {

    /**
     * Upload single product image
     * POST /api/upload/image
     * Requires: Admin authentication
     */
    app.post(
        "/api/upload/image",
        isAuthenticated,
        upload.single('image'),
        handleMulterError,  // Add error handler
        async (req: any, res) => {
            let uploadedMetadata: any = null;

            try {
                const userId = req.user?.uid;

                // Verify admin access
                const user = await storage.getUserById(userId);
                if (!user?.isAdmin) {
                    return res.status(403).json({
                        success: false,
                        message: "Admin access required"
                    });
                }

                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: "No image file provided"
                    });
                }

                console.log('[Upload] Single image upload request:', {
                    filename: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                });

                // Get image service (abstraction layer)
                const imageService = getImageService();

                // Upload to configured provider
                uploadedMetadata = await imageService.uploadImage(req.file.buffer, {
                    folder: 'electrical-products',
                });

                console.log('[Upload] Image uploaded successfully:', uploadedMetadata.providerImageId);

                // Return full metadata (not just URL)
                res.json({
                    success: true,
                    ...uploadedMetadata,
                });
            } catch (error) {
                console.error("[Upload] Single image error:", error);

                // Compensating action: Delete orphaned image if something fails after upload
                if (uploadedMetadata) {
                    try {
                        const imageService = getImageService();
                        await imageService.deleteImage(uploadedMetadata.providerImageId);
                        console.log('[Rollback] Deleted orphaned image:', uploadedMetadata.providerImageId);
                    } catch (deleteError) {
                        // Log orphaned image for cleanup job
                        console.error('[Orphan] Failed to delete orphan image:', uploadedMetadata.providerImageId, deleteError);
                    }
                }

                // Structured error response
                res.status(500).json({
                    success: false,
                    error: {
                        code: error instanceof Error && 'code' in error ? (error as any).code : 'UPLOAD_FAILED',
                        message: error instanceof Error ? error.message : 'Failed to upload image',
                        provider: uploadedMetadata?.provider || 'unknown',
                    }
                });
            }
        }
    );

    /**
     * Upload multiple product images
     * POST /api/upload/images
     * Requires: Admin authentication
     */
    app.post(
        "/api/upload/images",
        isAuthenticated,
        upload.array('images', 10), // Max 10 images
        handleMulterError,  // Add error handler
        async (req: any, res) => {
            try {
                const userId = req.user?.uid;

                // Verify admin access
                const user = await storage.getUserById(userId);
                if (!user?.isAdmin) {
                    return res.status(403).json({
                        success: false,
                        message: "Admin access required"
                    });
                }

                if (!req.files || req.files.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "No image files provided"
                    });
                }

                console.log('[Upload] Multiple images upload request:', {
                    count: req.files.length,
                    totalSize: req.files.reduce((sum: number, f: any) => sum + f.size, 0),
                });

                const imageService = getImageService();

                // Upload all images in parallel
                const uploadPromises = req.files.map((file: Express.Multer.File) =>
                    imageService.uploadImage(file.buffer, {
                        folder: 'electrical-products',
                    }).catch((err: Error) => {
                        console.error(`[Upload] Failed to upload ${file.originalname}:`, err);
                        return null; // Return null for failed uploads
                    })
                );

                const results = await Promise.all(uploadPromises);
                const successfulUploads = results.filter(r => r !== null);

                console.log('[Upload] Batch upload complete:', {
                    total: req.files.length,
                    successful: successfulUploads.length,
                    failed: req.files.length - successfulUploads.length,
                });

                res.json({
                    success: true,
                    images: successfulUploads.map(result => ({
                        url: result!.secureUrl,
                        publicId: result!.publicId,
                        width: result!.width,
                        height: result!.height,
                        format: result!.format,
                        size: result!.bytes,
                    })),
                    uploaded: successfulUploads.length,
                    failed: req.files.length - successfulUploads.length,
                });
            } catch (error) {
                console.error("[Upload] Multiple images error:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to upload images",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    );

    /**
     * Delete image from Cloudinary
     * DELETE /api/upload/image/:publicId
     * Requires: Admin authentication
     */
    app.delete(
        "/api/upload/image/:publicId(*)",
        isAuthenticated,
        async (req: any, res) => {
            try {
                const userId = req.user?.uid;

                // Verify admin access
                const user = await storage.getUserById(userId);
                if (!user?.isAdmin) {
                    return res.status(403).json({
                        success: false,
                        message: "Admin access required"
                    });
                }

                const { publicId } = req.params;

                if (!publicId) {
                    return res.status(400).json({
                        success: false,
                        message: "Public ID required"
                    });
                }

                console.log('[Upload] Delete image request:', publicId);

                const imageService = getImageService();
                await imageService.deleteImage(publicId);

                res.json({
                    success: true,
                    message: "Image deleted successfully",
                    publicId,
                });
            } catch (error) {
                console.error("[Upload] Delete error:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to delete image",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    );


    /**
     * Upload payment proof (Customer)
     * POST /api/upload/payment-proof
     * Requires: Authentication
     */
    app.post(
        "/api/upload/payment-proof",
        isAuthenticated,
        upload.single('image'),
        handleMulterError,  // Add error handler
        async (req: any, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: "No image file provided"
                    });
                }

                console.log('[Upload] Payment proof upload request:', {
                    userId: req.user?.uid,
                    filename: req.file.originalname,
                    size: req.file.size
                });

                // Upload to configured provider - specific folder for proofs
                const imageService = getImageService();
                const metadata = await imageService.uploadImage(req.file.buffer, {
                    folder: 'payment-proofs',
                });

                res.json({
                    success: true,
                    url: metadata.url,
                    providerImageId: metadata.providerImageId,
                });
            } catch (error) {
                console.error("[Upload] Payment proof error:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to upload payment proof",
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    );
}
