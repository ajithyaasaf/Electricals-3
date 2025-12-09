import type { Express } from "express";
import { isAuthenticated } from "../../firebaseAuth";
import {
    adminAddressService,
    AdminAddressQueries
} from "../../adminFirestoreService";
import { CreateAddressSchema } from "@shared/types";
import { ZodError } from "zod";

export function registerAddressRoutes(app: Express) {

    // Helper to unset default for other addresses
    const unsetOtherDefaults = async (userId: string, currentAddressId?: string) => {
        const userAddresses = await AdminAddressQueries.getUserAddresses(userId);
        const updates = userAddresses
            .filter(addr => addr.isDefault && addr.id !== currentAddressId)
            .map(addr => adminAddressService.update(addr.id, { isDefault: false }));
        await Promise.all(updates);
    };

    // Get user's addresses
    app.get("/api/addresses", isAuthenticated, async (req, res) => {
        try {
            if (!req.user?.uid) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const addresses = await AdminAddressQueries.getUserAddresses(req.user.uid);

            // Sort: Default first, then by createdAt desc
            const sortedAddresses = addresses.sort((a, b) => {
                if (a.isDefault === b.isDefault) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                return a.isDefault ? -1 : 1;
            });

            res.json(sortedAddresses);
        } catch (error) {
            console.error("Error fetching addresses:", error);
            res.status(500).json({ message: "Failed to fetch addresses" });
        }
    });

    // Create new address
    app.post("/api/addresses", isAuthenticated, async (req, res) => {
        try {
            if (!req.user?.uid) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const addressData = CreateAddressSchema.parse({
                ...req.body,
                userId: req.user.uid
            });

            const id = await adminAddressService.create(addressData);

            // If set as default, unset other defaults
            if (addressData.isDefault) {
                await unsetOtherDefaults(req.user.uid, id);
            }

            res.status(201).json({ id, ...addressData });
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ message: "Invalid address data", errors: error.errors });
            }
            console.error("Error creating address:", error);
            res.status(500).json({ message: "Failed to create address" });
        }
    });

    // Update address
    app.put("/api/addresses/:id", isAuthenticated, async (req, res) => {
        try {
            if (!req.user?.uid) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const addressId = req.params.id;
            const existingAddress = await adminAddressService.getById(addressId);

            if (!existingAddress) {
                return res.status(404).json({ message: "Address not found" });
            }

            if (existingAddress.userId !== req.user.uid) {
                return res.status(403).json({ message: "Forbidden" });
            }

            const updateData = CreateAddressSchema.parse({
                ...req.body,
                userId: req.user.uid
            });

            await adminAddressService.update(addressId, updateData);

            // If set as default, unset other defaults
            if (updateData.isDefault) {
                await unsetOtherDefaults(req.user.uid, addressId);
            }

            res.json({ id: addressId, ...updateData });
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ message: "Invalid address data", errors: error.errors });
            }
            console.error("Error updating address:", error);
            res.status(500).json({ message: "Failed to update address" });
        }
    });

    // Delete address
    app.delete("/api/addresses/:id", isAuthenticated, async (req, res) => {
        try {
            if (!req.user?.uid) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const addressId = req.params.id;
            const address = await adminAddressService.getById(addressId);

            if (!address) {
                return res.status(404).json({ message: "Address not found" });
            }

            if (address.userId !== req.user.uid) {
                return res.status(403).json({ message: "Forbidden" });
            }

            await adminAddressService.delete(addressId);
            res.json({ message: "Address deleted successfully" });
        } catch (error) {
            console.error("Error deleting address:", error);
            res.status(500).json({ message: "Failed to delete address" });
        }
    });
}
