import type { Express } from "express";
import multer from "multer";
import { isAuthenticated } from "../../firebaseAuth";
import { uploadImage, deleteImage } from "../lib/cloudinary";
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

                // Upload to Cloudinary
                const result = await uploadImage(req.file.buffer, {
                    folder: 'electrical-products',
                });

                console.log('[Upload] Image uploaded successfully:', result.publicId);

                res.json({
                    success: true,
                    url: result.secureUrl,
                    publicId: result.publicId,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    size: result.bytes,
                });
            } catch (error) {
                console.error("[Upload] Single image error:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to upload image",
                    error: error instanceof Error ? error.message : 'Unknown error'
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

                // Upload all images to Cloudinary in parallel
                const uploadPromises = req.files.map((file: Express.Multer.File) =>
                    uploadImage(file.buffer, {
                        folder: 'electrical-products',
                    }).catch(err => {
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

                await deleteImage(publicId);

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
}
