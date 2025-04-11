import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'; // file handling toll

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Click 'View API Keys' above to copy your cloud name
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:  process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if(!filePath) {
            throw new Error('File path is required');
        }
        // Upload the file to Cloudinary
       const response = await cloudinary.uploader.upload(filePath, {resource_type: 'auto'});

        console.log('File uploaded successfully', response.url);
        return response.url;
    } catch (error) {
        fs.unlinkSync(filePath); // Delete the file from local storage as upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary};