import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/db.connect";
import Booking from "../../../server/models/bookingModel";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify admin token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
  } catch {
    return res.status(401).json({ message: "Token invalid" });
  }

  await dbConnect();

  if (req.method === "GET") {
    try {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching bookings", error: error.message });
    }
  } else if (req.method === "PUT") {
    try {
      const { bookingId, paymentStatus } = req.body;
      if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required" });
      }

      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { paymentStatus },
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      return res.status(200).json({ success: true, data: booking });
    } catch (error: any) {
      return res.status(500).json({ message: "Error updating booking", error: error.message });
    }
  } else if (req.method === "DELETE") {
    try {
      const { bookingId } = req.body;
      if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required" });
      }

      const booking = await Booking.findByIdAndDelete(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      return res.status(200).json({ success: true, message: "Booking deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: "Error deleting booking", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
