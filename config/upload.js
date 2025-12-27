import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js"; // make sure this exists

// Configure Cloudinary storage - generic
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "tutorials",
      allowed_formats: ["jpg", "jpeg", "png", "mp4", "pdf", "ppt", "pptx"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

// For document uploads, use memory storage to avoid Cloudinary parsing issues
// Files will be uploaded to Cloudinary in the controller
const memoryStorage = multer.memoryStorage();

// Multer upload middleware
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

const documentUpload = multer({ 
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

export default upload;
export { documentUpload, cloudinary };
