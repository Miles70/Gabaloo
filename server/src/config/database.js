import mongoose from "mongoose";

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Create server/.env from server/.env.example.");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
