import uploadImageToCloudinary from "../utils/cloudinaryUpload.js";
import uploadAudioToSupabase from "../utils/supabaseUpload.js";

const uploadAdminImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File image belum dipilih.",
      });
    }

    const uploadedImage = await uploadImageToCloudinary(req.file);

    return res.status(201).json({
      success: true,
      message: "Image berhasil diupload ke Cloudinary.",
      data: {
        imageUrl: uploadedImage.secureUrl,
        secureUrl: uploadedImage.secureUrl,
        publicId: uploadedImage.publicId,
        format: uploadedImage.format,
        bytes: uploadedImage.bytes,
        width: uploadedImage.width,
        height: uploadedImage.height,
      },
    });
  } catch (error) {
    console.error("Upload admin image error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Upload image gagal. Periksa credential Cloudinary dan coba lagi.",
    });
  }
};

const uploadAdminAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File audio belum dipilih.",
      });
    }

    const uploadedAudio = await uploadAudioToSupabase(req.file);

    return res.status(201).json({
      success: true,
      message: "Audio berhasil diupload ke Supabase Storage.",
      data: {
        audioUrl: uploadedAudio.audioUrl,
        bucket: uploadedAudio.bucket,
        path: uploadedAudio.path,
        contentType: uploadedAudio.contentType,
        size: uploadedAudio.size,
      },
    });
  } catch (error) {
    console.error("Upload admin audio error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Upload audio gagal. Periksa credential Supabase, bucket, dan coba lagi.",
    });
  }
};

export { uploadAdminAudio, uploadAdminImage };