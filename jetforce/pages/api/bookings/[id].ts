import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/db.connect";
import Booking from "../../../server/models/bookingModel";
import jwt from "jsonwebtoken";

/**
 * GET /api/bookings/[id] — Get single booking details
 * PUT /api/bookings/[id] — Cancel a booking
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Booking ID is required" });
  }

  // Require authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Please login to access bookings" });
  }

  let decoded: any;
  try {
    const token = authHeader.split(" ")[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return res.status(401).json({ message: "Session expired. Please login again." });
  }

  await dbConnect();

  if (req.method === "GET") {
    try {
      const booking = await Booking.findOne({
        $or: [
          { _id: id, userId: decoded.id },
          { bookingId: id, userId: decoded.id },
          // Admin can view any booking
          ...(decoded.role === "admin" ? [{ _id: id }, { bookingId: id }] : []),
        ],
      }).lean();

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      return res.status(200).json({ success: true, data: booking });
    } catch (error: any) {
      console.error("Fetch booking error:", error.message);
      return res.status(500).json({ message: "Server error fetching booking" });
    }
  } else if (req.method === "PUT") {
    // Cancel booking
    try {
      const { action, cancelReason } = req.body;

      if (action !== "cancel") {
        return res.status(400).json({ message: "Invalid action. Only 'cancel' is supported." });
      }

      const booking = await Booking.findOne({
        $or: [
          { _id: id, userId: decoded.id },
          { bookingId: id, userId: decoded.id },
        ],
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Only allow cancellation for Confirmed bookings
      if (booking.bookingStatus === "Cancelled") {
        return res.status(400).json({ message: "This booking is already cancelled" });
      }

      if (booking.bookingStatus === "Completed") {
        return res.status(400).json({ message: "Cannot cancel a completed booking" });
      }

      booking.bookingStatus = "Cancelled";
      booking.cancelledAt = new Date();
      booking.cancelReason = cancelReason || "Cancelled by user";
      await booking.save();

      return res.status(200).json({
        success: true,
        data: booking,
        message: "Booking cancelled successfully",
      });
    } catch (error: any) {
      console.error("Cancel booking error:", error.message);
      return res.status(500).json({ message: "Server error cancelling booking" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
