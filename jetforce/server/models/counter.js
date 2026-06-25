const mongoose = require("mongoose");

const bookingCounterSchema = new mongoose.Schema({
  key: {
    type: String,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});

module.exports =
  mongoose.models.BookingCounter ||
  mongoose.model("BookingCounter", bookingCounterSchema);