const express = require("express");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const {
  authMiddleware,
  verifyAdmin,
  verifyUser,
} = require("../middleware/authMiddleware");
const { sendMessages, getMessages } = require("../controllers/messageController");
const Config = require("../config/index");

cloudinary.config({
  cloud_name: Config.CLOUDINARY_CLOUD_NAME,
  api_key: Config.CLOUDINARY_API_KEY,
  api_secret: Config.CLOUDINARY_API_SECRET,
});

const allowedFileTypes = {
  idea: ["application/zip", "application/x-zip-compressed"],
  issue: [
    "image/jpeg",
    "image/png",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
  ],
};

const fileFilter = (req, file, cb) => {
  if (!req.body.type) {
    return cb(new Error("Missing message type (idea or issue)"));
  }

  const type = req.body.type.toLowerCase();

  if (allowedFileTypes[type] && allowedFileTypes[type].includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error(" Invalid file type for the provided message type"), false);
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isZip = file.mimetype.includes("zip");
    return {
      folder: "uploads",
      public_id: `${Date.now()}-${file.originalname.trim().split(".").slice(0, -1).join(".")}`,
      resource_type: isZip ? "raw" : "auto", 
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, 
  fileFilter,
});

const router = express.Router();

router.post(
  "/sendMessages",
  authMiddleware,
  verifyUser,
  (req, res, next) => {
    upload.array("image", 5)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  sendMessages
);

router.get("/getMessages", authMiddleware, verifyAdmin, getMessages);

module.exports = router;
