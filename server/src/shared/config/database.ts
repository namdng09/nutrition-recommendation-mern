import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const db = process.env.MONGO_URI as string;

export const connectDB = async () => {
  try {
    await mongoose.connect(db);
    const { host, name, port } = mongoose.connection;
    console.log(`MongoDB connected: ${host}:${port}/${name}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
