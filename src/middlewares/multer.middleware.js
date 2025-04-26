import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {// cb = callback
      cb(null, './public/temp') // Set the destination to a temporary folder
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generate a unique suffix
      cb(null, file.originalname);
    }
  })
  
  export const upload = multer({ storage})