const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let folder = "spa-management/general";

        if (file.fieldname === "photo") folder = "spa-management/services";
        if (file.fieldname === "profileImage") folder = "spa-management/profiles";
        if (file.fieldname === "faceScreenshot") folder = "spa-management/faces";

        return {
            folder,
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            transformation: [{ width: 800, crop: "limit", quality: "auto" }],
        };
    },
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only JPG, JPEG, PNG, WEBP images are allowed"), false);
        }
        cb(null, true);
    },
});

module.exports = { upload, cloudinary };
