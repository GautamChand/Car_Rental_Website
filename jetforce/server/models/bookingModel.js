const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  // User reference (optional for guest bookings)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  bookingId: { type: String, required: true, unique: true },
  rideOption: { type: String, required: true },
  pickUpDate: { type: String, required: true },
  pickUpTime: { type: String, required: true },
  origins: { type: String, required: true },
  destinations: { type: String, default: "" },
  numberPassengers: { type: Number, required: true },

  // Payment fields
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending",
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentIntentId: { type: String },

  // Booking lifecycle
  bookingStatus: {
    type: String,
    enum: ["Confirmed", "InProgress", "Completed", "Cancelled"],
    default: "Confirmed",
  },
  cancelledAt: { type: Date },
  cancelReason: { type: String },

  // Ride details
  addOns: { type: [mongoose.Schema.Types.Mixed], default: [] },
  airline: { type: String },
  flightNumber: { type: String },
  phoneNumber: { type: String },
  hourlyService: { type: String },
  carChoice: { type: String },
  seatOption: { type: String },
  amount: { type: Number, default: 0 },
  paymentEnvironment: {
    type: String,
    enum: ["Test", "Production"],
    default: "Test",
  },

  // Driver assignment
  driverName: { type: String },
  driverEmail: { type: String },
  driverPhone: { type: String },
}, {
  timestamps: true,
  strict: true,
});

// Indexes for common queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ email: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ bookingStatus: 1 });

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
