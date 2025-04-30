import mongoose from "mongoose";
export const connectDB = async (): Promise<void> => {
  try {
    const mongouri = process.env.MONGO_URI;
    if (!mongouri) {
      throw new Error("MONGO_URI is not defined");
    }
    const connect = await mongoose.connect(mongouri);
    console.log(`MongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.log(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};
export default mongoose;
