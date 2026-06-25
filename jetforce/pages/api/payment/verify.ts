import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import dbConnect from "../../../utils/db.connect";
import Booking from "../../../server/models/bookingModel";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// Import driver assignment utility
import assignDriverByBookingCount from "../../../server/utils/assignDriver";

/**
 * POST /api/payment/verify
 * Verifies Razorpay payment signature, creates booking, assigns driver, sends email
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      reservationDetails,
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    if (!reservationDetails) {
      return res.status(400).json({ message: "Missing reservation details" });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed — invalid signature",
        paymentStatus: "Failed",
      });
    }

    // Payment verified — create booking
    await dbConnect();

    // Check for authenticated user
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        userId = decoded.id;
      } catch {
        // Continue as guest
      }
    }

    // Assign driver using round-robin
    let assignedDriver = { name: "", email: "", phone: "" };
    try {
      assignedDriver = await assignDriverByBookingCount();
    } catch (err: any) {
      console.error("Driver assignment failed:", err.message);
      // Continue without driver — admin can assign later
    }

    // Generate booking ID
    const bookingId = `JF-${uuidv4().substring(0, 8).toUpperCase()}`;

    const booking = await Booking.create({
      userId,
      name: `${reservationDetails.firstName} ${reservationDetails.lastName}`.trim(),
      email: reservationDetails.email,
      phoneNumber: reservationDetails.phone,
      bookingId,
      rideOption: reservationDetails.rideOption || "",
      pickUpDate: reservationDetails.date || "",
      pickUpTime: reservationDetails.time || "",
      origins: reservationDetails.pickup || "",
      destinations: reservationDetails.destination || "",
      numberPassengers: reservationDetails.numberPassengers || 1,
      carChoice: reservationDetails.carChoice || "",
      amount: amount || 0,
      seatOption: reservationDetails.seatOption || "",
      airline: reservationDetails.airlinename || "",
      flightNumber: reservationDetails.flightnumber || "",
      hourlyService: reservationDetails.hourlyservice || "",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: "Paid",
      bookingStatus: "Confirmed",
      driverName: assignedDriver.name || "",
      driverEmail: assignedDriver.email || "",
      driverPhone: assignedDriver.phone || "",
      paymentEnvironment: "Test",
    });

    // Send confirmation email (non-blocking)
    try {
      const emailService = await import("../../../server/utils/emailService");
      await emailService.sendEmail({
        email: reservationDetails.email,
        driverEmail: assignedDriver.email || process.env.OWNER_EMAIL,
        params: {
          projectName: "DriveElite",
          name: `${reservationDetails.firstName} ${reservationDetails.lastName}`.trim(),
          rideOption: reservationDetails.rideOption || "",
          pickUpDate: reservationDetails.date || "",
          pickUpTime: reservationDetails.time || "",
          origins: reservationDetails.pickup || "",
          destinations: reservationDetails.destination || "",
          numberPassengers: reservationDetails.numberPassengers || "",
          carChoice: reservationDetails.carChoice || "",
          hourlyService: reservationDetails.hourlyservice || "",
          airline: reservationDetails.airlinename || "",
          flightNumber: reservationDetails.flightnumber || "",
          email: reservationDetails.email || "",
          phone: reservationDetails.phone || "",
          paymentStatus: "Paid",
          paymentIntentId: razorpay_payment_id,
          amount: amount || 0,
          addOns: "",
          bookingId,
          seatOption: reservationDetails.seatOption || "",
          driverName: assignedDriver.name || "",
          driverPhone: assignedDriver.phone || "",
        },
      });
    } catch (emailError: any) {
      console.error("Email send failed:", emailError.message);
      // Don't fail the booking because of email
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed",
      data: {
        bookingId: booking.bookingId,
        paymentStatus: "Paid",
        bookingStatus: "Confirmed",
      },
    });
  } catch (error: any) {
    console.error("Payment verification error:", error.message);
    return res.status(500).json({
      message: "Server error during payment verification",
    });
  }
}
