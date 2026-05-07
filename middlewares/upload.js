import multer from "multer";
import path from "path";
import fs from "fs";

// BASE folders
const brandPath = path.join("public", "assets", "brand");
const modelPath = path.join("public", "assets", "models");
const productPath = path.join("public", "assets", "products");

// Create folders if not exist
[brandPath, modelPath, productPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    if (file.fieldname === "brandImage") {
      return cb(null, brandPath);
    }

    if (file.fieldname === "modelImage") {
      return cb(null, modelPath);
    }

    if (file.fieldname === "thumbnail" || file.fieldname === "images" || file.fieldname === "gallery") {
      return cb(null, productPath);
    }

    cb(null, "public/assets/");
  },

  filename: function (req, file, cb) {
    // cb(null, Date.now() + "-" + file.originalname);
    cb(null, file.originalname);
  }
});

export const upload = multer({ storage });

// Brand upload
export const brandUpload = upload.single("brandImage");

// Model upload
export const modelUpload = upload.single("modelImage");

// Create product upload (thumbnail + images[])
export const productUpload = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 10 }
]);

// Gallery upload
export const uploadPhoto = upload;
