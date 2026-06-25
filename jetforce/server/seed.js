const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

// --- Helper: Convert MongoDB Extended JSON to plain objects ---
function convertExtendedJSON(data) {
  if (Array.isArray(data)) {
    return data.map(convertExtendedJSON);
  }
  if (data !== null && typeof data === "object") {
    // Handle $oid
    if (data.$oid) {
      return new mongoose.Types.ObjectId(data.$oid);
    }
    // Handle $date
    if (data.$date) {
      return new Date(data.$date);
    }
    // Recurse into nested objects
    const result = {};
    for (const key of Object.keys(data)) {
      result[key] = convertExtendedJSON(data[key]);
    }
    return result;
  }
  return data;
}

// --- Load JSON files ---
function loadJSON(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  return convertExtendedJSON(parsed);
}

async function seed() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully");

    const db = mongoose.connection.db;

    // Path to the JSON files
    const dbFilesDir = path.resolve(__dirname, "../../../db filess/db filess");

    // --- Seed collections ---
    const collections = [
      { file: "JetForce.bookings.json", collection: "bookings" },
      { file: "JetForce.conditionedprices.json", collection: "conditionedprices" },
      { file: "JetForce.drivers.json", collection: "drivers" },
      { file: "JetForce.pricemaps.json", collection: "pricemaps" },
      { file: "JetForce.rides.json", collection: "rides" },
      { file: "JetForce.theme_settings.json", collection: "theme_settings" },
      { file: "JetForce.vehicles.json", collection: "vehicles" },
    ];

    for (const { file, collection } of collections) {
      const filePath = path.join(dbFilesDir, file);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠ File not found: ${filePath}, skipping...`);
        continue;
      }

      const data = loadJSON(filePath);

      // Drop existing collection if it exists
      const existingCollections = await db.listCollections({ name: collection }).toArray();
      if (existingCollections.length > 0) {
        await db.dropCollection(collection);
        console.log(`  Dropped existing collection: ${collection}`);
      }

      // Insert data
      if (data.length > 0) {
        await db.collection(collection).insertMany(data);
        console.log(`✓ Seeded ${collection}: ${data.length} documents`);
      } else {
        console.log(`  No data to seed for ${collection}`);
      }
    }

    // --- Seed admin user ---
    console.log("\n--- Seeding admin user ---");
    const User = require("./models/userModel");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@driveelite.com" });
    if (existingAdmin) {
      console.log("✓ Admin user already exists, skipping...");
    } else {
      await User.create({
        name: "Gautam & Himanshu",
        email: "admin@driveelite.com",
        password: "Admin@123",
        phone: "9027412161",
        role: "admin",
      });
      console.log("✓ Admin user created (admin@driveelite.com / Admin@123)");
    }

    // --- Seed a demo user ---
    const existingUser = await User.findOne({ email: "user@driveelite.com" });
    if (existingUser) {
      console.log("✓ Demo user already exists, skipping...");
    } else {
      await User.create({
        name: "Demo User",
        email: "user@driveelite.com",
        password: "User@123",
        phone: "1234567890",
        role: "user",
      });
      console.log("✓ Demo user created (user@driveelite.com / User@123)");
    }

    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
}

seed();
