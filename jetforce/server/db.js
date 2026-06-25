const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("Database is already connected");
      return mongoose.connection.db;
    }

    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    // Connect to MongoDB
    const connection = await mongoose.connect(MONGO_URI);

    console.log("Database connection successful");

    const db = connection.connection.db;

    // Show all collections
    const collections = await db.listCollections().toArray();

    console.log("Collections in database:");

    if (collections.length === 0) {
      console.log("No collections found.");
    } else {
      collections.forEach((collection) => {
        console.log(`- ${collection.name}`);
      });
    }

    return db;
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;