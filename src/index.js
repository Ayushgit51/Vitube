import express from 'express';
// import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import { DB_NAME } from './constants.js';
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
}); // Load environment variables from .env file

const app = express(); // Initialize the Express app

connectDB() // Connect to MongoDB
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.error("MongoDB connection Error: ", error);
    process.exit(1); // Exit the process with failure
});














/* // Approach 1 to connect database
const app = express();

( async () => {
    try {
       await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
       app.on("error", (error) =>{
        console.error("Error: ", error);
        throw error;
       })
         app.listen(process.env.PORT, () => {
          console.log(`Server is running on port ${process.env.PORT}`);
         })
    } catch (error) {
        console.error("Error: ", error);
    }
}) ()
*/