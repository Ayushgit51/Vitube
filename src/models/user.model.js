import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ApiResponse } from "../utils/ApiResponse.js";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudnary url
        required: true,
    },
    coverImage: {
        type: String, // cloudnary url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String,
    }
}
, {
    timestamps: true
});

userSchema.pre("save", async function (next) {
    // if the password is not modified, skip hashing
    if (!this.isModified("password")) {
        return next();
    }
    // Hash the password before saving to the database
    //if the password is modified
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// comparing users password with hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
    // Compare the provided password with the hashed password
    return await bcrypt.compare(password, this.password /*hassed password */);
}

// generating access token
userSchema.methods.generateAccessToken = function () {
    // Generate an access token using the user's ID and a secret key
    return jwt.sign(
        {   _id: this._id, 
            email: this.email, 
            username: this.username, 
            fullName: this.fullName
        },
         process.env.ACCESS_TOKEN_SECRET, 
         {expiresIn: process.env.ACCESS_TOKEN_EXPIRY});
}

// generating refresh token
userSchema.methods.generateRefreshToken = function () {
    // Generate a refresh token using the user's ID and a secret key
    return jwt.sign(
        {   
            _id: this._id
        },
         process.env.REFRESH_TOKEN_SECRET, 
         {expiresIn: process.env.REFRESH_TOKEN_EXPIRY});
}

export const User = mongoose.model("User", userSchema);