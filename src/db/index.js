import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    try {
        const connctionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected successfully !! DB HOST: ${connctionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection Error: ", error);
        process.exit(1); // Exit the process with failure
    }
}

export default connectDB;