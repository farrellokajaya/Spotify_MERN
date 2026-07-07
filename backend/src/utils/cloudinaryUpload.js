import getCloudinaryClient from "../config/cloudinary.js";

const uploadImageToCloudinary = (file) => {
  const cloudinary = getCloudinaryClient();
  const folder = process.env.CLOUDINARY_FOLDER || "soundify";

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${folder}/images`,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary tidak mengembalikan secure_url"));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      },
    );

    uploadStream.end(file.buffer);
  });
};

export default uploadImageToCloudinary;