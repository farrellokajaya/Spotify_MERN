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

export const getAdminDashboard = (token) => {
  return apiRequest("/api/admin/dashboard", {
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

export const getAdminAlbums = (token) => {
  return apiRequest("/api/admin/albums", {
    headers: createAuthHeaders(token),
  });
};

export const getAdminAlbum = (token, albumId) => {
  return apiRequest(`/api/admin/albums/${albumId}`, {
    headers: createAuthHeaders(token),
  });
};

export const createAdminAlbum = (token, payload) => {
  return apiRequest("/api/admin/albums", {
    method: "POST",
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload),
  });
};

export const updateAdminAlbum = (token, albumId, payload) => {
  return apiRequest(`/api/admin/albums/${albumId}`, {
    method: "PUT",
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload),
  });
};

export const deleteAdminAlbum = (token, albumId) => {
  return apiRequest(`/api/admin/albums/${albumId}`, {
    method: "DELETE",
    headers: createAuthHeaders(token),
  });
};

export const getAdminSongs = (token) => {
  return apiRequest("/api/admin/songs", {
    headers: createAuthHeaders(token),
  });
};

export const getAdminSong = (token, songId) => {
  return apiRequest(`/api/admin/songs/${songId}`, {
    headers: createAuthHeaders(token),
  });
};

export const createAdminSong = (token, payload) => {
  return apiRequest("/api/admin/songs", {
    method: "POST",
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload),
  });
};

export const updateAdminSong = (token, songId, payload) => {
  return apiRequest(`/api/admin/songs/${songId}`, {
    method: "PUT",
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload),
  });
};

export const deleteAdminSong = (token, songId) => {
  return apiRequest(`/api/admin/songs/${songId}`, {
    method: "DELETE",
    headers: createAuthHeaders(token),
  });
};

export const getMusicHome = () => {
  return apiRequest("/api/music/home");
};

export const searchMusic = (query) => {
  const searchParams = new URLSearchParams({ query });

  return apiRequest(`/api/music/search?${searchParams.toString()}`);
};

export const getPublicArtistDetail = (identifier) => {
  return apiRequest(`/api/music/artists/${identifier}`);
};

export const getPublicAlbumDetail = (identifier) => {
  return apiRequest(`/api/music/albums/${identifier}`);
};

export const getFavoriteSongs = (token) => {
  return apiRequest("/api/library/favorites", {
    headers: createAuthHeaders(token),
  });
};

export const addFavoriteSong = (token, songId) => {
  return apiRequest(`/api/library/favorites/${songId}`, {
    method: "POST",
    headers: createAuthHeaders(token),
  });
};

export const removeFavoriteSong = (token, songId) => {
  return apiRequest(`/api/library/favorites/${songId}`, {
    method: "DELETE",
    headers: createAuthHeaders(token),
  });
};

export const checkFavoriteSong = (token, songId) => {
  return apiRequest(`/api/library/favorites/check/${songId}`, {
    headers: createAuthHeaders(token),
  });
};

export const getUserPlaylists = (token) => {
  return apiRequest("/api/playlists", {
    headers: createAuthHeaders(token),
  });
};

export const getPlaylistDetail = (token, playlistId) => {
  return apiRequest(`/api/playlists/${playlistId}`, {
    headers: createAuthHeaders(token),
  });
};

export const createPlaylist = (token, payload) => {
  return apiRequest("/api/playlists", {
    method: "POST",
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload),
  });
};

export const updatePlaylist = (token, playlistId, payload) => {
  return apiRequest(`/api/playlists/${playlistId}`, {
    method: "PUT",
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload),
  });
};

export const deletePlaylist = (token, playlistId) => {
  return apiRequest(`/api/playlists/${playlistId}`, {
    method: "DELETE",
    headers: createAuthHeaders(token),
  });
};

export const addSongToPlaylist = (token, playlistId, songId) => {
  return apiRequest(`/api/playlists/${playlistId}/songs/${songId}`, {
    method: "POST",
    headers: createAuthHeaders(token),
  });
};

export const removeSongFromPlaylist = (token, playlistId, songId) => {
  return apiRequest(`/api/playlists/${playlistId}/songs/${songId}`, {
    method: "DELETE",
    headers: createAuthHeaders(token),
  });
};

export const getRecentlyPlayed = (token) => {
  return apiRequest("/api/history/recent", {
    headers: createAuthHeaders(token),
  });
};

export const recordSongPlay = (token, songId) => {
  return apiRequest(`/api/history/songs/${songId}`, {
    method: "POST",
    headers: createAuthHeaders(token),
  });
};

export const clearRecentlyPlayed = (token) => {
  return apiRequest("/api/history/clear", {
    method: "DELETE",
    headers: createAuthHeaders(token),
  });
};