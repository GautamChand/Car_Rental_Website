const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();

const connectDB = require("./db");

const ridesRoutes = require("./routes/ridesRoutes");
const themeSettingsRoutes = require("./routes/themesRoutes");
const vehiclesRoutes = require("./routes/vehiclesRoutes");
const priceCalculation = require("./routes/calculateDistance");
const razorpayRoutes = require("./routes/razorpayRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 8080;

// Connect Database
connectDB();

// Middleware
app.use(cors());

app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      if (req.originalUrl === "/api/webhook") {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rides", ridesRoutes);
app.use("/api/theme-settings", themeSettingsRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/prices", priceCalculation);

// Razorpay Route
app.use("/api/razorpay", razorpayRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("DriveElite API Running");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});