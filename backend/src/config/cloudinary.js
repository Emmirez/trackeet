import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (filePath, folder = "trackeet") => {
  const compressedPath = filePath + "_compressed.jpg";

  await sharp(filePath)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toFile(compressedPath);

  const result = await cloudinary.uploader.upload(compressedPath, { folder });

  // Clean up temp files
  try {
    fs.unlinkSync(filePath);
  } catch {}
  try {
    fs.unlinkSync(compressedPath);
  } catch {}

  return result.secure_url;
};

export default cloudinary;
