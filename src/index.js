
// import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import { DB_NAME } from './constants.js';
import connectDB from './db/index.js';
import {app} from './app.js'; // Import the app instance

dotenv.config({
    path: './.env'
}); // Load environment variables from .env file


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
// Middleware to parse JSON requests
















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