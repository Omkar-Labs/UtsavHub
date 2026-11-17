import mongoose from "mongoose";

/**
 * Database connection utility.
 * Connects to MongoDB asynchronously using Mongoose.
 */
const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || "utsavhub",
    });

    console.log(`✅ MongoDB Connected successfully! Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Exit process with failure code if connection fails
    process.exit(1);
  }
};

export default dbConnect;
