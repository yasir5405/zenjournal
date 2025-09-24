import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log("Database has been connected.");
      })
      .catch((e) => {
        console.log("Error connecting to Database: ", e.message);
      });
  } catch (error) {
    console.log("Error connecting to Database: ", e.message);
  }
};
