import crypto from "crypto";
import path from "path";

const sanitizeBaseName = (fileName) => {
  return path
    .parse(fileName)
    .name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
};

const getSafeExtension = (fileName, fallbackExtension = "") => {
  const extension = path.extname(fileName).toLowerCase().replace(".", "");

  return extension || fallbackExtension;
};

const buildMediaFileName = (file, fallbackExtension = "") => {
  const baseName = sanitizeBaseName(file.originalname) || "media";
  const extension = getSafeExtension(file.originalname, fallbackExtension);
  const uniqueId = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;

  return extension
    ? `${baseName}-${uniqueId}.${extension}`
    : `${baseName}-${uniqueId}`;
};

export default buildMediaFileName;