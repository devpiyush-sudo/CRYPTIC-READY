import mongoose from "mongoose";

// Accepts MONGO_URI (preferred) or MONGO_URL (older name used in this project).
export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  const conn = await mongoose.connect(mongoUri);
  console.log("MongoDB connected:", conn.connection.host);
}
