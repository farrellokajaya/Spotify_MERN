const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const validationMessage = data?.errors?.[0]?.message;

    throw new Error(
      validationMessage ||
        data?.message ||
        `Request gagal dengan status ${response.status}`,
    );
  }

  return data;
};

const createAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const getHealthStatus = () => {
  return apiRequest("/api/health");
};

export const registerUser = (payload) => {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const loginUser = (payload) => {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getCurrentUser = (token) => {
  return apiRequest("/api/auth/me", {
    headers: createAuthHeaders(token),
  });
};

export const getAdminArtists = (token) => {
  return apiRequest("/api/admin/artists", {
    headers: createAuthHeaders(token),
  });
};

export const getAdminArtist = (token, artistId) => {
  return apiRequest(`/api/admin/artists/${artistId}`, {
    headers: createAuthHeaders(token),
  });
};

export const createAdminArtist = (token, payload) => {
  return apiRequest("/api/admin/artists", {
    method: "POST",
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload),
  });
};

export const updateAdminArtist = (token, artistId, payload) => {
  return apiRequest(`/api/admin/artists/${artistId}`, {
    method: "PUT",
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload),
  });
};

export const deleteAdminArtist = (token, artistId) => {
  return apiRequest(`/api/admin/artists/${artistId}`, {
    method: "DELETE",
    headers: createAuthHeaders(token),
  });
};