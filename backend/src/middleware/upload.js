import multer from "multer";
import path from "path";
import os from "os";

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, os.tmpdir()),
  filename: (_, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (_, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Images only"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
