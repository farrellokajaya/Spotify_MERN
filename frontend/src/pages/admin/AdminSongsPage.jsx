import { useEffect, useMemo, useState } from "react";
import MediaUploadField from "../../components/admin/MediaUploadField";

import useAuth from "../../hooks/useAuth";
import {
  createAdminSong,
  deleteAdminSong,
  getAdminAlbums,
  getAdminArtists,
  getAdminSong,
  getAdminSongs,
  updateAdminSong,
} from "../../services/api";

const initialForm = {
  title: "",
  artist: "",
  album: "",
  durationSeconds: "",
  trackNumber: "",
  audioUrl: "",
  coverImageUrl: "",
  lyrics: "",
  genres: "",
  isPublished: false,
};

const formatDuration = (seconds) => {
  if (!seconds) {
    return "-";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const getSongInitial = (song) => {
  return (song.title || "S").charAt(0).toUpperCase();
};

const getArtistName = (song) => {
  return song.artist?.name || "Unknown artist";
};

const getAlbumTitle = (song) => {
  return song.album?.title || "Single / no album";
};

const mapSongToForm = (song) => ({
  title: song.title || "",
  artist: song.artist?.id || "",
  album: song.album?.id || "",
  durationSeconds: song.durationSeconds || "",
  trackNumber: song.trackNumber || "",
  audioUrl: song.audioUrl || "",
  coverImageUrl: song.coverImageUrl || "",
  lyrics: song.lyrics || "",
  genres: Array.isArray(song.genres) ? song.genres.join(", ") : "",
  isPublished: Boolean(song.isPublished),
});

const mapFormToPayload = (form) => ({
  title: form.title.trim(),
  artist: form.artist,
  album: form.album || "",
  durationSeconds: Number(form.durationSeconds),
  trackNumber: form.trackNumber ? Number(form.trackNumber) : "",
  audioUrl: form.audioUrl.trim(),
  coverImageUrl: form.coverImageUrl.trim(),
  lyrics: form.lyrics.trim(),
  genres: form.genres
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean),
  isPublished: form.isPublished,
});

function AdminSongsPage() {
  const { token } = useAuth();

  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState(initialForm);
  const [formMode, setFormMode] = useState("create");
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const activeArtists = useMemo(() => {
    return artists.filter((artist) => artist.isActive);
  }, [artists]);

  const availableAlbums = useMemo(() => {
    if (!form.artist) {
      return [];
    }

    return albums.filter((album) => {
      return album.artist?.id === form.artist;
    });
  }, [albums, form.artist]);

  const publishedSongs = useMemo(() => {
    return songs.filter((song) => song.isPublished).length;
  }, [songs]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminSongs(token);
      setSongs(response.data.songs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const [songResponse, artistResponse, albumResponse] = await Promise.all([
        getAdminSongs(token),
        getAdminArtists(token),
        getAdminAlbums(token),
      ]);

      setSongs(songResponse.data.songs);
      setArtists(artistResponse.data.artists);
      setAlbums(albumResponse.data.albums);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const fetchInitialData = async () => {
      try {
        const [songResponse, artistResponse, albumResponse] =
          await Promise.all([
            getAdminSongs(token),
            getAdminArtists(token),
            getAdminAlbums(token),
          ]);

        if (!ignore) {
          setSongs(songResponse.data.songs);
          setArtists(artistResponse.data.artists);
          setAlbums(albumResponse.data.albums);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      ignore = true;
    };
  }, [token]);

  const resetForm = () => {
    setForm(initialForm);
    setFormMode("create");
    setSelectedSongId(null);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => {
      if (name === "artist") {
        return {
          ...currentForm,
          artist: value,
          album: "",
        };
      }

      return {
        ...currentForm,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleEdit = async (songId) => {
    try {
      setLoadingDetail(true);
      setFormError("");
      setSuccessMessage("");

      const response = await getAdminSong(token, songId);

      setForm(mapSongToForm(response.data.song));
      setFormMode("edit");
      setSelectedSongId(response.data.song.id);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setFormError("");
      setSuccessMessage("");

      const payload = mapFormToPayload(form);

      const response =
        formMode === "edit" && selectedSongId
          ? await updateAdminSong(token, selectedSongId, payload)
          : await createAdminSong(token, payload);

      resetForm();
      setSuccessMessage(response.message);
      await loadSongs();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (song) => {
    const confirmed = window.confirm(
      `Hapus lagu "${song.title}" dari ${getArtistName(song)}? Tindakan ini tidak bisa dibatalkan.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(song.id);
      setError("");
      setSuccessMessage("");

      const response = await deleteAdminSong(token, song.id);

      setSuccessMessage(response.message);
      await loadSongs();

      if (selectedSongId === song.id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="sf-admin-artist-page">
      <div className="sf-admin-summary-grid" aria-label="Song summary">
        <article className="sf-admin-summary-card">
          <span>Total Songs</span>
          <strong>{songs.length}</strong>
        </article>

        <article className="sf-admin-summary-card">
          <span>Published Songs</span>
          <strong>{publishedSongs}</strong>
        </article>
      </div>

      <div className="sf-admin-crud-grid">
        <section className="sf-admin-table-card">
          <div className="sf-admin-table-header sf-admin-table-header-row">
            <div>
              <p className="sf-eyebrow">Songs</p>

              <h2 className="sf-admin-table-title">Song list</h2>

              <p className="sf-admin-table-subtitle">
                Kelola lagu, relasi artist, relasi album, durasi, audio URL,
                dan status publikasi.
              </p>
            </div>

            <button
              className="sf-admin-secondary-button"
              type="button"
              onClick={loadInitialData}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {successMessage ? (
            <div className="sf-admin-alert sf-admin-alert-success" role="status">
              {successMessage}
            </div>
          ) : null}

          {error ? (
            <div className="sf-admin-alert sf-admin-alert-error" role="alert">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="sf-admin-empty">Memuat data lagu...</div>
          ) : null}

          {!loading && !error && songs.length === 0 ? (
            <div className="sf-admin-empty">
              Belum ada lagu. Tambahkan lagu pertama dari form di samping.
            </div>
          ) : null}

          {!loading && !error && songs.length > 0 ? (
            <div className="sf-admin-table-wrap">
              <table className="sf-admin-table">
                <thead>
                  <tr>
                    <th>Song</th>
                    <th>Artist</th>
                    <th>Album</th>
                    <th>Duration</th>
                    <th>Track</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>

                <tbody>
                  {songs.map((song) => (
                    <tr key={song.id}>
                      <td>
                        <div className="sf-admin-artist-cell">
                          <span className="sf-admin-artist-avatar">
                            {getSongInitial(song)}
                          </span>

                          <div>
                            <strong>{song.title}</strong>
                            <small>{song.slug}</small>
                          </div>
                        </div>
                      </td>

                      <td>{getArtistName(song)}</td>

                      <td>{getAlbumTitle(song)}</td>

                      <td>{formatDuration(song.durationSeconds)}</td>

                      <td>{song.trackNumber || "-"}</td>

                      <td>
                        <span
                          className={
                            song.isPublished
                              ? "sf-admin-status active"
                              : "sf-admin-status inactive"
                          }
                        >
                          {song.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td>
                        <div className="sf-admin-row-actions">
                          <button
                            className="sf-admin-secondary-button"
                            type="button"
                            onClick={() => handleEdit(song.id)}
                            disabled={loadingDetail || deletingId === song.id}
                          >
                            Edit
                          </button>

                          <button
                            className="sf-admin-danger-button"
                            type="button"
                            onClick={() => handleDelete(song)}
                            disabled={deletingId === song.id}
                          >
                            {deletingId === song.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <aside className="sf-admin-form-card" aria-label="Song form">
          <div className="sf-admin-table-header">
            <p className="sf-eyebrow">
              {formMode === "edit" ? "Edit Song" : "New Song"}
            </p>

            <h2 className="sf-admin-table-title">
              {formMode === "edit" ? "Update song" : "Add song"}
            </h2>

            <p className="sf-admin-table-subtitle">
              Pilih artist terlebih dahulu, lalu album akan difilter otomatis.
            </p>
          </div>

          {formError ? (
            <div className="sf-admin-alert sf-admin-alert-error" role="alert">
              {formError}
            </div>
          ) : null}

          <form className="sf-admin-form" onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Contoh: Evaluasi"
                minLength="1"
                maxLength="120"
                required
              />
            </label>

            <label>
              <span>Artist</span>
              <select
                name="artist"
                value={form.artist}
                onChange={handleChange}
                required
              >
                <option value="">Pilih artist aktif</option>
                {activeArtists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Album</span>
              <select
                name="album"
                value={form.album}
                onChange={handleChange}
                disabled={!form.artist}
              >
                <option value="">Single / no album</option>
                {availableAlbums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title}
                  </option>
                ))}
              </select>
              <small>
                Album bersifat opsional. Untuk single, biarkan pilihan no album.
              </small>
            </label>

            <label>
              <span>Duration Seconds</span>
              <input
                type="number"
                name="durationSeconds"
                value={form.durationSeconds}
                onChange={handleChange}
                placeholder="215"
                min="1"
                max="7200"
                required
              />
              <small>Isi durasi dalam detik. Contoh 3 menit 35 detik = 215.</small>
            </label>

            <label>
              <span>Track Number</span>
              <input
                type="number"
                name="trackNumber"
                value={form.trackNumber}
                onChange={handleChange}
                placeholder="1"
                min="1"
                max="999"
              />
            </label>

            <label>
              <span>Audio URL</span>
                <MediaUploadField
                  label="Song Audio"
                  type="audio"
                  value={form.audioUrl}
                  onChange={(url) =>
                    setForm((prev) => ({
                      ...prev,
                      audioUrl: url,
                    }))
                  }
                  placeholder="Masukkan audioUrl song atau upload audio"
                  helperText="Format: mp3, wav, ogg, m4a. Maksimal 25MB."
                />
            </label>

            <label>
              <span>Cover Image</span>
              <MediaUploadField
                label="Song Cover"
                type="image"
                value={form.coverImageUrl}
                onChange={(url) =>
                  setForm((prev) => ({
                    ...prev,
                    coverImageUrl: url,
                  }))
                }
                placeholder="Masukkan coverImageUrl song atau upload cover"
                helperText="Format: jpg, jpeg, png, webp. Maksimal 5MB."
              />
            </label>

            <label>
              <span>Genres</span>
              <input
                type="text"
                name="genres"
                value={form.genres}
                onChange={handleChange}
                placeholder="Pop, Indie, R&B"
              />
              <small>Pisahkan beberapa genre dengan koma. Maksimal 8 genre.</small>
            </label>

            <label>
              <span>Lyrics</span>
              <textarea
                name="lyrics"
                value={form.lyrics}
                onChange={handleChange}
                placeholder="Masukkan lirik lagu"
                rows="6"
                maxLength="10000"
              />
            </label>

            <label className="sf-admin-checkbox">
              <input
                type="checkbox"
                name="isPublished"
                checked={form.isPublished}
                onChange={handleChange}
              />
              <span>Lagu sudah dipublikasikan</span>
            </label>

            <div className="sf-admin-form-actions">
              <button
                className="sf-admin-primary-button"
                type="submit"
                disabled={submitting || loadingDetail || activeArtists.length === 0}
              >
                {submitting ? "Saving..." : "Save song"}
              </button>

              {formMode === "edit" ? (
                <button
                  className="sf-admin-secondary-button"
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            {activeArtists.length === 0 ? (
              <small>
                Buat atau aktifkan minimal satu artist sebelum menambahkan lagu.
              </small>
            ) : null}
          </form>
        </aside>
      </div>
    </section>
  );
}

export default AdminSongsPage;