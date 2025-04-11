import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({limit: '100kb'})); // Parse JSON data
app.use(express.urlencoded({limit: '100kb', extended: true})); // Parse URL-encoded data
app.use(express.static('public')); // Serve static files from the public directory
app.use(cookieParser());

// Import routes
import userRouter from './routes/user.routes.js';

// routes declaration
app.use("/api/v1/users", userRouter);


export {app}