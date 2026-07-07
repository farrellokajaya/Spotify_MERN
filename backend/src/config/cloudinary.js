import { v2 as cloudinary } from "cloudinary";

const requiredCloudinaryEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const getMissingCloudinaryEnv = () => {
  return requiredCloudinaryEnv.filter((key) => !process.env[key]);
};

const getCloudinaryClient = () => {
  const missingEnv = getMissingCloudinaryEnv();

  if (missingEnv.length > 0) {
    throw new Error(
      `Cloudinary credential belum lengkap: ${missingEnv.join(", ")}`,
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return cloudinary;
};

export default getCloudinaryClient;