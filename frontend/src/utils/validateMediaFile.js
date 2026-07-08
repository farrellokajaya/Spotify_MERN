const allowedImageExtensions = ["jpg", "jpeg", "png", "webp"];
const allowedAudioExtensions = ["mp3", "wav", "ogg", "m4a"];

const maxImageSize = 5 * 1024 * 1024;
const maxAudioSize = 25 * 1024 * 1024;

const getExtension = (filename = "") => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

const formatSize = (bytes) => {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
};

export const validateMediaFile = ({ file, type }) => {
  if (!file) {
    return "Silakan pilih file terlebih dahulu.";
  }

  const extension = getExtension(file.name);

  if (type === "image") {
    if (!allowedImageExtensions.includes(extension)) {
      return "Format image tidak valid. Gunakan jpg, jpeg, png, atau webp.";
    }

    if (file.size > maxImageSize) {
      return `Ukuran image terlalu besar. File kamu ${formatSize(
        file.size,
      )}, maksimal 5MB.`;
    }

    return "";
  }

  if (type === "audio") {
    if (!allowedAudioExtensions.includes(extension)) {
      return "Format audio tidak valid. Gunakan mp3, wav, ogg, atau m4a.";
    }

    if (file.size > maxAudioSize) {
      return `Ukuran audio terlalu besar. File kamu ${formatSize(
        file.size,
      )}, maksimal 25MB.`;
    }

    return "";
  }

  return "Tipe file tidak dikenali.";
};