import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: String, // cloudinary url
        required: true
    },
    thumbnail: {
        type: String, // cloudinary url
        required: true
    },
    title: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
        required: true
    },
    duration: {
        type: Number, // cloudinary url
        required: true
    },
    videoFileId: {
        type: Number, // cloudinary url
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},
    {
    timestamps: true
    }
);

videoSchema.plugin(mongooseAggregatePaginate); // Add pagination plugin to the schema


export const Video = mongoose.model("Video", videoSchema);
// This code defines a Mongoose schema for a video model in a MongoDB database.