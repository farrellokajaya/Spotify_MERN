import path from "path";
import multer from "multer";

const ONE_MB = 1024 * 1024;

const allowedImageMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

const allowedAudioMimeTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/x-mpeg",
  "audio/mpeg3",
  "audio/x-mpeg-3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "application/ogg",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "application/octet-stream",
];

const allowedAudioExtensions = [".mp3", ".wav", ".ogg", ".m4a"];

const getFileExtension = (fileName) => {
  return path.extname(fileName || "").toLowerCase();
};

const createFileFilter = ({
  allowedMimeTypes,
  allowedExtensions,
  typeLabel,
}) => {
  return (req, file, callback) => {
    const extension = getFileExtension(file.originalname);
    const isExtensionAllowed = allowedExtensions.includes(extension);
    const isMimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);

    if (!isExtensionAllowed) {
      callback(
        new Error(
          `Format ${typeLabel} tidak valid. Gunakan ${allowedExtensions.join(
            ", ",
          )}.`,
        ),
      );
      return;
    }

    if (!isMimeTypeAllowed) {
      callback(
        new Error(
          `Tipe file ${typeLabel} tidak valid. File terdeteksi sebagai ${file.mimetype}.`,
        ),
      );
      return;
    }

    callback(null, true);
  };
};

const createUploadMiddleware = ({
  maxFileSize,
  allowedMimeTypes,
  allowedExtensions,
  typeLabel,
}) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      files: 1,
      fileSize: maxFileSize,
    },
    fileFilter: createFileFilter({
      allowedMimeTypes,
      allowedExtensions,
      typeLabel,
    }),
  }).single("file");

  return (req, res, next) => {
    upload(req, res, (error) => {
      if (!error) {
        next();
        return;
      }

      if (error instanceof multer.MulterError) {
        const message =
          error.code === "LIMIT_FILE_SIZE"
            ? `${typeLabel} terlalu besar. Maksimal ${Math.round(
                maxFileSize / ONE_MB,
              )}MB.`
            : error.code === "LIMIT_UNEXPECTED_FILE"
              ? 'Field upload tidak sesuai. Gunakan field name "file".'
              : error.message;

        return res.status(400).json({
          success: false,
          message,
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || `Upload ${typeLabel} tidak valid.`,
      });
    });
  };
};

const uploadImageFile = createUploadMiddleware({
  maxFileSize: 5 * ONE_MB,
  allowedMimeTypes: allowedImageMimeTypes,
  allowedExtensions: allowedImageExtensions,
  typeLabel: "image",
});

const uploadAudioFile = createUploadMiddleware({
  maxFileSize: 25 * ONE_MB,
  allowedMimeTypes: allowedAudioMimeTypes,
  allowedExtensions: allowedAudioExtensions,
  typeLabel: "audio",
});

export { uploadAudioFile, uploadImageFile };