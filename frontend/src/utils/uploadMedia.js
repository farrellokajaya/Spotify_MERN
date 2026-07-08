const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const getToken = () => {
  return (
    localStorage.getItem("soundify_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken")
  );
};

const getFriendlyUploadMessage = (message, type) => {
  if (!message) {
    return `Upload ${type} gagal. Silakan coba lagi.`;
  }

  if (message.toLowerCase().includes("cloudinary")) {
    return "Upload image gagal. Periksa credential Cloudinary di backend.";
  }

  if (message.toLowerCase().includes("supabase")) {
    return "Upload audio gagal. Periksa Supabase URL, service role key, dan bucket audio di backend.";
  }

  if (message.toLowerCase().includes("jwt")) {
    return "Sesi login tidak valid. Silakan login ulang sebagai admin.";
  }

  if (message.toLowerCase().includes("token")) {
    return "Sesi login tidak ditemukan atau sudah kedaluwarsa. Silakan login ulang.";
  }

  return message;
};

export const uploadMedia = async ({ file, type }) => {
  const token = getToken();

  if (!token) {
    throw new Error("Sesi login tidak ditemukan. Silakan login ulang sebagai admin.");
  }

  const endpoint =
    type === "audio"
      ? `${API_URL}/api/admin/upload/audio`
      : `${API_URL}/api/admin/upload/image`;

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getFriendlyUploadMessage(data?.message, type));
  }

  if (type === "audio") {
    return data?.data?.audioUrl || "";
  }

  return data?.data?.imageUrl || data?.data?.secureUrl || "";
};