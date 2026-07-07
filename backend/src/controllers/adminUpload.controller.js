import uploadImageToCloudinary from "../utils/cloudinaryUpload.js";
import uploadAudioToSupabase from "../utils/supabaseUpload.js";

const getDevelopmentDetail = (error) => {
  if (process.env.NODE_ENV !== "production") {
    return { detail: error.message };
  }

  return {};
};

const uploadAdminImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File image wajib dikirim dengan field name "image"',
      });
    }

    const uploadedImage = await uploadImageToCloudinary(req.file);

    return res.status(201).json({
      success: true,
      message: "Image berhasil diupload ke Cloudinary",
      data: uploadedImage,
    });
  } catch (error) {
    console.error("Upload admin image error:", error);

    return res.status(502).json({
      success: false,
      message: "Gagal upload image ke Cloudinary",
      ...getDevelopmentDetail(error),
    });
  }
};

const uploadAdminAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File audio wajib dikirim dengan field name "audio"',
      });
    }

    const uploadedAudio = await uploadAudioToSupabase(req.file);

    return res.status(201).json({
      success: true,
      message: "Audio berhasil diupload ke Supabase Storage",
      data: uploadedAudio,
    });
  } catch (error) {
    console.error("Upload admin audio error:", error);

    return res.status(502).json({
      success: false,
      message: "Gagal upload audio ke Supabase Storage",
      ...getDevelopmentDetail(error),
    });
  }
};

export { uploadAdminAudio, uploadAdminImage };