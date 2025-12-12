import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "../../firebaseAuth";
import { CreateServiceBookingSchema } from "@shared/types";

export function registerServiceRoutes(app: Express) {
  // Get service bookings
  app.get("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const user = await storage.getUserById(userId);

      let bookings;
      if (user?.isAdmin) {
        bookings = await storage.getAllServiceBookings();
      } else {
        bookings = await storage.getUserServiceBookings(userId);
      }

      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Create service booking
  app.post("/api/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const bookingData = { ...CreateServiceBookingSchema.parse(req.body), userId };

      const bookingId = await storage.createServiceBooking(bookingData);
      const booking = await storage.getServiceBookingById(bookingId);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  // ------------------------------------------------------------------
  // Service Catalog Routes (Missing in original audit)
  // ------------------------------------------------------------------

  // Get all services with filtering
  app.get("/api/services", async (req, res) => {
    try {
      const { categoryId, search, sortBy = "newest", sortOrder = "desc", limit = 20, offset = 0 } = req.query;

      let services: any[] = [];

      // Basic fetching strategy
      if (categoryId) {
        services = await storage.getServicesByCategory(categoryId as string);
      } else {
        services = await storage.getAllServices();
      }

      // In-memory search (since Firestore simple search is limited)
      if (search) {
        const searchLower = (search as string).toLowerCase();
        services = services.filter(s =>
          s.name.toLowerCase().includes(searchLower) ||
          s.description.toLowerCase().includes(searchLower)
        );
      }

      // Sorting
      services = services.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "price":
            // Handle potential string/number mismatch safely
            const priceA = parseFloat(a.startingPrice?.toString() || "0");
            const priceB = parseFloat(b.startingPrice?.toString() || "0");
            comparison = priceA - priceB;
            break;
          case "rating":
            comparison = (a.rating || 0) - (b.rating || 0);
            break;
          case "newest":
          default:
            comparison = a.id.localeCompare(b.id);
            break;
        }
        return sortOrder === "desc" ? -comparison : comparison;
      });

      // Pagination
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);
      const paginatedServices = services.slice(offsetNum, offsetNum + limitNum);

      res.json({
        services: paginatedServices,
        total: services.length,
        limit: limitNum,
        offset: offsetNum
      });
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Get service by slug
  app.get("/api/services/slug/:slug", async (req, res) => {
    try {
      const service = await storage.getServiceBySlug(req.params.slug);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service by slug:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  // Get service by ID
  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getServiceById(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  // ------------------------------------------------------------------
  // Service Booking Routes (Existing)
  // ------------------------------------------------------------------
}