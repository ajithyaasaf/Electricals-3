/**
 * Site Content Routes - Admin CMS API
 * 
 * Backend API for managing site content (Why Choose section, banners, etc.)
 * This replaces direct Firestore writes from the frontend, ensuring:
 * - Server-side validation with Zod schemas
 * - Admin role enforcement
 * - Audit trail (lastUpdated, updatedBy fields)
 * - Single source of truth for business logic
 * 
 * @see docs/ARCHITECTURE_DECISION.md
 */

import type { Express, Request, Response } from "express";
import { isAuthenticated } from "../../firebaseAuth";
import { storage } from "../../storage";
import { z } from "zod";
import { getFirestore } from "firebase-admin/firestore";

// ═══════════════════════════════════════════════════════════════════════════
// ZOD SCHEMAS - Validation & Type Safety
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Feature card schema for Why Choose section
 */
const FeatureStatSchema = z.object({
    value: z.string().min(1, "Stat value is required").max(20, "Stat value too long"),
    label: z.string().min(1, "Stat label is required").max(50, "Stat label too long"),
});

const FeatureSchema = z.object({
    id: z.string().min(1, "Feature ID is required"),
    icon: z.enum([
        "Shield", "Clock", "Award", "Users", "Zap",
        "CheckCircle", "Star", "TrendingUp", "Phone", "MapPin"
    ], { errorMap: () => ({ message: "Invalid icon name" }) }),
    title: z.string().min(1, "Title is required").max(100, "Title too long"),
    benefit: z.string().min(1, "Benefit is required").max(500, "Benefit too long"),
    stat: FeatureStatSchema.optional(),
    order: z.number().int().min(0).max(100).optional(),
});

/**
 * Why Choose section schema
 * Validates the complete CMS data structure
 */
const WhyChooseSectionSchema = z.object({
    headline: z.string()
        .min(1, "Headline is required")
        .max(200, "Headline too long (max 200 chars)"),
    bulletReasons: z.array(
        z.string().min(1, "Reason cannot be empty").max(500, "Reason too long")
    )
        .min(1, "At least one reason is required")
        .max(10, "Maximum 10 reasons allowed"),
    ctaText: z.string()
        .min(1, "CTA text is required")
        .max(50, "CTA text too long (max 50 chars)"),
    features: z.array(FeatureSchema)
        .min(1, "At least one feature is required")
        .max(12, "Maximum 12 features allowed"),
});

/**
 * Generic site content schema for extensibility
 * New content types can be added here
 */
const SiteContentSchemaMap: Record<string, z.ZodSchema> = {
    whyChooseSection: WhyChooseSectionSchema,
    // Future content types can be added:
    // heroBanner: HeroBannerSchema,
    // testimonials: TestimonialsSchema,
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

type WhyChooseSectionData = z.infer<typeof WhyChooseSectionSchema>;

interface SiteContentDocument {
    id: string;
    createdAt?: string;
    lastUpdated?: string;
    createdBy?: string;
    updatedBy?: string;
    [key: string]: any;
}

interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email?: string;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get Firestore instance (admin SDK)
 * Uses singleton pattern to avoid multiple initializations
 */
function getDb() {
    return getFirestore();
}

/**
 * Check if user has admin privileges
 */
async function isAdmin(userId: string): Promise<boolean> {
    try {
        const user = await storage.getUserById(userId);
        return user?.isAdmin === true;
    } catch (error) {
        console.error("[SiteContent] Error checking admin status:", error);
        return false;
    }
}

/**
 * Validate content against schema based on document type
 */
function validateContent(docId: string, data: unknown): { success: true; data: any } | { success: false; error: z.ZodError } {
    const schema = SiteContentSchemaMap[docId];

    if (!schema) {
        // For unknown document types, allow any valid object
        // This provides flexibility for future content types
        const genericSchema = z.object({}).passthrough();
        const result = genericSchema.safeParse(data);
        if (result.success) {
            return { success: true, data: result.data };
        }
        return { success: false, error: result.error };
    }

    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
}

/**
 * Format Zod error for API response
 */
function formatZodError(error: z.ZodError): { field: string; message: string }[] {
    return error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message,
    }));
}

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

export function registerSiteContentRoutes(app: Express) {
    const COLLECTION_NAME = "siteContent";

    /**
     * GET /api/admin/site-content/:docId
     * 
     * Fetch a site content document by ID
     * Requires admin authentication
     */
    app.get("/api/admin/site-content/:docId", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user?.uid;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            // Admin check
            if (!await isAdmin(userId)) {
                return res.status(403).json({
                    success: false,
                    message: "Admin access required"
                });
            }

            const db = getDb();
            const docRef = db.collection(COLLECTION_NAME).doc(req.params.docId);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return res.status(404).json({
                    success: false,
                    message: `Content '${req.params.docId}' not found`
                });
            }

            const data = docSnap.data();

            res.json({
                success: true,
                data: {
                    id: docSnap.id,
                    ...data,
                }
            });
        } catch (error) {
            console.error("[SiteContent] GET error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch site content"
            });
        }
    });

    /**
     * GET /api/site-content/:docId (Public read)
     * 
     * Public endpoint for fetching site content
     * Used for server-side rendering fallback
     */
    app.get("/api/site-content/:docId", async (req: Request, res: Response) => {
        try {
            const db = getDb();
            const docRef = db.collection(COLLECTION_NAME).doc(req.params.docId);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return res.status(404).json({
                    success: false,
                    message: `Content '${req.params.docId}' not found`
                });
            }

            const data = docSnap.data();

            // Remove internal fields from public response
            const { createdBy, updatedBy, ...publicData } = data || {};

            res.json({
                success: true,
                data: {
                    id: docSnap.id,
                    ...publicData,
                }
            });
        } catch (error) {
            console.error("[SiteContent] Public GET error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch site content"
            });
        }
    });

    /**
     * PUT /api/admin/site-content/:docId
     * 
     * Update an existing site content document
     * Requires admin authentication
     * Validates data against schema
     */
    app.put("/api/admin/site-content/:docId", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user?.uid;
            const docId = req.params.docId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            // Admin check
            if (!await isAdmin(userId)) {
                return res.status(403).json({
                    success: false,
                    message: "Admin access required"
                });
            }

            // Validate content
            const validation = validateContent(docId, req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: formatZodError(validation.error),
                });
            }

            const db = getDb();
            const docRef = db.collection(COLLECTION_NAME).doc(docId);

            // Check if document exists
            const existingDoc = await docRef.get();
            const now = new Date().toISOString();

            const updateData = {
                ...validation.data,
                lastUpdated: now,
                updatedBy: userId,
                // Preserve creation metadata if document exists
                ...(existingDoc.exists ? {} : {
                    createdAt: now,
                    createdBy: userId,
                }),
            };

            await docRef.set(updateData, { merge: true });

            // Fetch updated document
            const updatedDoc = await docRef.get();

            console.log(`[SiteContent] Updated '${docId}' by user ${userId}`);

            res.json({
                success: true,
                message: "Content updated successfully",
                data: {
                    id: updatedDoc.id,
                    ...updatedDoc.data(),
                }
            });
        } catch (error) {
            console.error("[SiteContent] PUT error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update site content"
            });
        }
    });

    /**
     * POST /api/admin/site-content/:docId
     * 
     * Create a new site content document
     * Requires admin authentication
     * Validates data against schema
     */
    app.post("/api/admin/site-content/:docId", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user?.uid;
            const docId = req.params.docId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            // Admin check
            if (!await isAdmin(userId)) {
                return res.status(403).json({
                    success: false,
                    message: "Admin access required"
                });
            }

            // Validate content
            const validation = validateContent(docId, req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: formatZodError(validation.error),
                });
            }

            const db = getDb();
            const docRef = db.collection(COLLECTION_NAME).doc(docId);

            // Check if document already exists
            const existingDoc = await docRef.get();
            if (existingDoc.exists) {
                return res.status(409).json({
                    success: false,
                    message: `Content '${docId}' already exists. Use PUT to update.`
                });
            }

            const now = new Date().toISOString();
            const createData = {
                ...validation.data,
                createdAt: now,
                lastUpdated: now,
                createdBy: userId,
                updatedBy: userId,
            };

            await docRef.set(createData);

            // Fetch created document
            const createdDoc = await docRef.get();

            console.log(`[SiteContent] Created '${docId}' by user ${userId}`);

            res.status(201).json({
                success: true,
                message: "Content created successfully",
                data: {
                    id: createdDoc.id,
                    ...createdDoc.data(),
                }
            });
        } catch (error) {
            console.error("[SiteContent] POST error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create site content"
            });
        }
    });

    /**
     * DELETE /api/admin/site-content/:docId
     * 
     * Delete a site content document
     * Requires admin authentication
     */
    app.delete("/api/admin/site-content/:docId", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user?.uid;
            const docId = req.params.docId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            // Admin check
            if (!await isAdmin(userId)) {
                return res.status(403).json({
                    success: false,
                    message: "Admin access required"
                });
            }

            const db = getDb();
            const docRef = db.collection(COLLECTION_NAME).doc(docId);

            // Check if document exists
            const existingDoc = await docRef.get();
            if (!existingDoc.exists) {
                return res.status(404).json({
                    success: false,
                    message: `Content '${docId}' not found`
                });
            }

            await docRef.delete();

            console.log(`[SiteContent] Deleted '${docId}' by user ${userId}`);

            res.json({
                success: true,
                message: "Content deleted successfully",
            });
        } catch (error) {
            console.error("[SiteContent] DELETE error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to delete site content"
            });
        }
    });

    /**
     * GET /api/admin/site-content
     * 
     * List all site content documents
     * Requires admin authentication
     */
    app.get("/api/admin/site-content", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user?.uid;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            // Admin check
            if (!await isAdmin(userId)) {
                return res.status(403).json({
                    success: false,
                    message: "Admin access required"
                });
            }

            const db = getDb();
            const snapshot = await db.collection(COLLECTION_NAME).get();

            const documents = snapshot.docs.map(doc => ({
                id: doc.id,
                lastUpdated: doc.data().lastUpdated,
                createdAt: doc.data().createdAt,
            }));

            res.json({
                success: true,
                data: documents,
                count: documents.length,
            });
        } catch (error) {
            console.error("[SiteContent] LIST error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to list site content"
            });
        }
    });

    console.log("[Routes] Site content routes registered");
}
