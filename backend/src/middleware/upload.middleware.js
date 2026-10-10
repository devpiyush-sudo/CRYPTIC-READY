import multer from "multer";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
    if (!ok) return cb(new Error("Only image and video uploads are allowed"));
    cb(null, true);
  },
});
