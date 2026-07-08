import multer from "multer";

const storage = multer.memoryStorage();

const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const audioMimeTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
];

export const uploadImageMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!imageMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Format image tidak didukung. Gunakan jpg, jpeg, png, atau webp.")
      );
    }

    cb(null, true);
  },
});

export const uploadAudioMiddleware = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!audioMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Format audio tidak didukung. Gunakan mp3, wav, ogg, atau m4a.")
      );
    }

    cb(null, true);
  },
});