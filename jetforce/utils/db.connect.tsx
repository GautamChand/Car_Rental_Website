// lib/dbConnect.ts — Cached MongoDB connection for Next.js serverless
import mongoose from 'mongoose';

// Cache the connection across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

const connectDB = async (): Promise<mongoose.Connection['db']> => {
  // Return cached connection if available
  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn.connection.db;
  }

  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  // If a connection promise is already in flight, await it
  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose.connect(MONGO_URI).then((m) => {
      console.log("Database connection successful");
      return m;
    });
  }

  try {
    global.mongooseCache.conn = await global.mongooseCache.promise;
    const db = global.mongooseCache.conn.connection.db;
    if (!db) {
      throw new Error("Failed to get database instance");
    }
    return db;
  } catch (error) {
    // Reset cache on failure so next request retries
    global.mongooseCache.promise = null;
    global.mongooseCache.conn = null;
    if (error instanceof Error) {
      console.error("Error connecting to the database:", error.message);
    }
    throw new Error("Failed to connect to the database");
  }
};

export default connectDB;
