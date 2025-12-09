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
}