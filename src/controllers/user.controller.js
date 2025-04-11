import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';

const registerUser = asyncHandler(async (req, res) => {
    // Your registration logic here

    // get the user data from the request body
    const {fullName, email, username, password} = req.body
    console.log(fullName, email, username, password);

    // validate the user data - not empty
    if(fullName === "" || email === "" || username === "" || password === "" /* or [fullName, email, username, password].some(field) => field?.trim() === ""*/) {
        throw new ApiError(400, "All fields are required");
    }

    // check if the user already exists (username , email)
    const existedUser = await User.findOne({$or: [{email}, {username}]});
    if (existedUser) {
        throw new ApiError(400, "User already exists");     
    }

    // chck for files (avatar, image)
    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log(req.files?.avatar[0]?.path);

    const coverImageLocalPath = req.files?.coverImage[0]?.path
    console.log(req.files?.coverImage[0]?.path);

    // check avatar 
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // upload files to cloudinary (aavatar, image)
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // again checking avatar
    if(!avatar) {
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
    if(!CreatedUser) {
        throw new ApiError(500, "User creation failed , Server error");
    }

    // remove the password from the response token field from rsponse

    // return the user data
    return res.status(201).json(
        new ApiResponse(200, CreatedUser, "User created successfully")
    );
});

export {registerUser};