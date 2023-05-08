import mongoose from "mongoose";

import env from "../utils/validateEnv";

export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to MongoDB ✅");
  } catch (error) {
    console.log("Failed to connect to the db ❌");
    console.log(error);
  }
};
