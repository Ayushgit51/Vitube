import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = (async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // save the refresh token in the database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        // return the tokens
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
});

const registerUser = asyncHandler(async (req, res) => {
    // Your registration logic here

    // get the user data from the request body
    const { fullName, email, username, password } = req.body
    console.log(fullName, email, username, password);

    // validate the user data - not empty
    if (fullName === "" || email === "" || username === "" || password === "" /* or [fullName, email, username, password].some(field) => field?.trim() === ""*/) {
        throw new ApiError(400, "All fields are required");
    }

    // check if the user already exists (username , email)
    const existedUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existedUser) {
        throw new ApiError(400, "User already exists");
    }
    console.log(req.files);
    // check if the user already exists (username , email)

    // chck for files (avatar, image)
    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log(req.files?.avatar[0]?.path);

    //const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
        console.log(req.files?.coverImage[0]?.path);
    }

    // check avatar 
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // upload files to cloudinary (aavatar, image)
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // again checking avatar
    if (!avatar || !avatar?.url) {
        throw new ApiError(400, "Avatar upload failed");
    }

    // create a new user object - create entrt in databse
    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    // check user craeted successfully
    const CreatedUser = await User.findById(user._id).select("-password -refreshToken")
    if (!CreatedUser) {
        throw new ApiError(500, "User creation failed , Server error");
    }

    // remove the password from the response token field from rsponse

    // return the user data
    return res.status(201).json(
        new ApiResponse(200, CreatedUser, "User created successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // Your login logic here
    // get the user data from the request body
    const { email, password } = req.body
    console.log(email, password);
    // validate the user data - not empty
    if (email === "" || password === "" /* or [email, password].some(field) => field?.trim() === ""*/) {
        throw new ApiError(400, "All fields are required");
    }
    // check if the user already exists (username , email)
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(400, "User not found");
    }
    // check if the password is correct
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid User credentials");
    }
    // generate access token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, { accessToken, refreshToken, user: loggedInUser },
                "User logged in successfully")
        );
});


const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized access");
    }

    // verify the token
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        // generate new access token
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: true
        };
        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(200, { accessToken, newRefreshToken }, "Access token refreshed successfully")
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");

    }
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid OLD password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});


const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, username } = req.body
    console.log(fullName, email, username);

    // validate the user data - not empty
    if (fullName === "" || email === "" || username === "" /* or [fullName, email, username].some(field) => field?.trim() === ""*/) {
        throw new ApiError(400, "All fields are required");
    }

    // check if the user already exists (username , email)
    const existedUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existedUser) {
        throw new ApiError(400, "User already exists");
    }

    // update the user data
    const updatedUser = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName,
            email,
            username: username.toLowerCase()
        }
    }, { new: true }).select("-password");

    return res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    console.log(req.file?.path);

    // check avatar 
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // upload files to cloudinary (aavatar, image)
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    // again checking avatar
    if (!avatar || !avatar?.url) {
        throw new ApiError(400, "Avatar upload failed");
    }

    // update the user data
    const updatedUser = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url
        }
    }, { new: true }).select("-password");

    return res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const updateCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path
    console.log(req.file?.path);

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required");
    }

    // upload files to cloudinary (aavatar, image)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // again checking avatar
    if (!coverImage || !coverImage?.url) {
        throw new ApiError(400, "Cover image upload failed");
    }

    // update the user data
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: coverImage.url
        }
    }, { new: true }).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
})

export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateAvatar, 
    updateCoverImage 
};