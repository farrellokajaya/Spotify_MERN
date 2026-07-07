import getSupabaseClient from "../config/supabase.js";
import buildMediaFileName from "./mediaFileName.js";

const normalizeBucketName = (bucketName) => {
  return bucketName.trim().replace(/^\/+|\/+$/g, "");
};

const getAudioBucketName = () => {
  const bucketName = normalizeBucketName(
    process.env.SUPABASE_AUDIO_BUCKET || "soundify-audio",
  );

  if (!bucketName) {
    throw new Error("SUPABASE_AUDIO_BUCKET belum diisi");
  }

  if (bucketName.includes("/") || bucketName.includes("http")) {
    throw new Error(
      "SUPABASE_AUDIO_BUCKET salah. Isi hanya nama bucket, contoh: soundify-audio",
    );
  }

  return bucketName;
};

const getSafeAudioExtension = (file) => {
  const originalName = file.originalname || "";
  const lowerName = originalName.toLowerCase();

  if (lowerName.endsWith(".wav")) return "wav";
  if (lowerName.endsWith(".ogg")) return "ogg";
  if (lowerName.endsWith(".m4a")) return "m4a";

  return "mp3";
};

const getAudioContentType = (file) => {
  if (file.mimetype && file.mimetype !== "application/octet-stream") {
    return file.mimetype;
  }

  const extension = getSafeAudioExtension(file);

  if (extension === "wav") return "audio/wav";
  if (extension === "ogg") return "audio/ogg";
  if (extension === "m4a") return "audio/mp4";

  return "audio/mpeg";
};

const uploadAudioToSupabase = async (file) => {
  const supabase = getSupabaseClient();
  const bucketName = getAudioBucketName();
  const extension = getSafeAudioExtension(file);
  const fileName = buildMediaFileName(file, extension);
  const filePath = `songs/${fileName}`;
  const contentType = getAudioContentType(file);

  const { error } = await supabase.storage.from(bucketName).upload(
    filePath,
    file.buffer,
    {
      contentType,
      cacheControl: "3600",
      upsert: false,
    },
  );

  if (error) {
    throw new Error(error.message || "Upload audio ke Supabase gagal");
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Supabase tidak mengembalikan public URL");
  }

  return {
    audioUrl: data.publicUrl,
    bucket: bucketName,
    path: filePath,
    contentType,
    size: file.size,
  };
};

export default uploadAudioToSupabase;