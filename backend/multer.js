const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null,"./uploads/"); //destination folder for files
    },
    filename: function (req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname)); // Unique Filename
    },
});

// File Filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")){
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"), false);
    }
};

// initialize multer instance
const upload = multer({ storage, fileFilter});

module.exports = upload;