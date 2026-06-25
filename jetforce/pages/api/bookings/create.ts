import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/db.connect";
import Booking from "../../../server/models/bookingModel";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/bookings/create — Create a new booking
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    await dbConnect();

    const {
      name,
      email,
      phoneNumber,
      rideOption,
      pickUpDate,
      pickUpTime,
      origins,
      destinations,
      numberPassengers,
      carChoice,
      amount,
      seatOption,
      airline,
      flightNumber,
      hourlyService,
      addOns,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentStatus,
      driverName,
      driverEmail,
      driverPhone,
    } = req.body;

    // Validate required fields
    if (!name || !email || !rideOption || !pickUpDate || !pickUpTime || !origins) {
      return res.status(400).json({
        message: "Missing required fields: name, email, rideOption, pickUpDate, pickUpTime, origins",
      });
    }

    if (!numberPassengers || numberPassengers < 1) {
      return res.status(400).json({ message: "Number of passengers must be at least 1" });
    }

    // Check for authenticated user (optional — guest bookings allowed)
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        userId = decoded.id;
      } catch {
        // Token invalid — proceed as guest
      }
    }

    // Generate unique booking ID
    const bookingId = `JF-${uuidv4().substring(0, 8).toUpperCase()}`;

    const booking = await Booking.create({
      userId,
      name,
      email,
      phoneNumber,
      bookingId,
      rideOption,
      pickUpDate,
      pickUpTime,
      origins,
      destinations: destinations || "",
      numberPassengers,
      carChoice: carChoice || "",
      amount: amount || 0,
      seatOption: seatOption || "",
      airline: airline || "",
      flightNumber: flightNumber || "",
      hourlyService: hourlyService || "",
      addOns: addOns || [],
      razorpayOrderId: razorpayOrderId || "",
      razorpayPaymentId: razorpayPaymentId || "",
      razorpaySignature: razorpaySignature || "",
      paymentStatus: paymentStatus || "Pending",
      bookingStatus: "Confirmed",
      driverName: driverName || "",
      driverEmail: driverEmail || "",
      driverPhone: driverPhone || "",
      paymentEnvironment: "Test",
    });

    return res.status(201).json({
      success: true,
      data: booking,
      message: "Booking created successfully",
    });
  } catch (error: any) {
    console.error("Create booking error:", error.message);
    return res.status(500).json({ message: "Server error creating booking" });
  }
}
