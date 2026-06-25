const BookingCounter = require("../models/counter");
const connectDB = require("../db");
const Driver = require("../models/driver");

const assignDriverByBookingCount = async () => {
  try {
    // Connect DB
    await connectDB();

    // Get all drivers
    const drivers = await Driver.find().sort({ createdAt: 1 });

    if (!drivers.length) {
      throw new Error("No drivers available");
    }

    // Find booking counter
    let counter = await BookingCounter.findOne({
      key: "bookingCount",
    });

    // Create counter if not exists
    if (!counter) {
      counter = await BookingCounter.create({
        key: "bookingCount",
        count: 0,
      });
    }

    // Round-robin assignment
    const assignedDriver =
      drivers[counter.count % drivers.length];

    // Increase count
    counter.count += 1;

    await counter.save();

    return assignedDriver;
  } catch (error) {
    console.error("Driver assignment error:", error.message);
    throw error;
  }
};

module.exports = assignDriverByBookingCount;