import dotenv from "dotenv";

dotenv.config();

import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const ConnectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MongoDB_URI}/${DB_Name} `,
    );

    console.log(`MongoDB connected ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB error", error);
  }
};

export default ConnectDb;
