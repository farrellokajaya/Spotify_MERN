import { useEffect, useMemo, useState } from "react";

import useAuth from "../../hooks/useAuth";
import {
  createAdminAlbum,
  deleteAdminAlbum,
  getAdminAlbum,
  getAdminAlbums,
  getAdminArtists,
  updateAdminAlbum,
} from "../../services/api";

const initialForm = {
  title: "",
  artist: "",
  description: "",
  coverImageUrl: "",
  releaseDate: "",
  type: "album",
  genres: "",
  isPublished: false,
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateInput = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
};

const getAlbumInitial = (album) => {
  return (album.title || "A").charAt(0).toUpperCase();
};

const getArtistName = (album) => {
  return album.artist?.name || "Unknown artist";
};

const mapAlbumToForm = (album) => ({
  title: album.title || "",
  artist: album.artist?.id || "",
  description: album.description || "",
  coverImageUrl: album.coverImageUrl || "",
  releaseDate: formatDateInput(album.releaseDate),
  type: album.type || "album",
  genres: Array.isArray(album.genres) ? album.genres.join(", ") : "",
  isPublished: Boolean(album.isPublished),
});

const mapFormToPayload = (form) => ({
  title: form.title.trim(),
  artist: form.artist,
  description: form.description.trim(),
  coverImageUrl: form.coverImageUrl.trim(),
  releaseDate: form.releaseDate,
  type: form.type,
  genres: form.genres
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean),
  isPublished: form.isPublished,
});

function AdminAlbumsPage() {
  const { token } = useAuth();

  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState(initialForm);
  const [formMode, setFormMode] = useState("create");
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const activeArtists = useMemo(() => {
    return artists.filter((artist) => artist.isActive);
  }, [artists]);

  const publishedAlbums = useMemo(() => {
    return albums.filter((album) => album.isPublished).length;
  }, [albums]);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminAlbums(token);
      setAlbums(response.data.albums);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadArtists = async () => {
    const response = await getAdminArtists(token);
    setArtists(response.data.artists);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const [albumResponse, artistResponse] = await Promise.all([
        getAdminAlbums(token),
        getAdminArtists(token),
      ]);

      setAlbums(albumResponse.data.albums);
      setArtists(artistResponse.data.artists);
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
        const [albumResponse, artistResponse] = await Promise.all([
          getAdminAlbums(token),
          getAdminArtists(token),
        ]);

        if (!ignore) {
          setAlbums(albumResponse.data.albums);
          setArtists(artistResponse.data.artists);
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
    setSelectedAlbumId(null);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = async (albumId) => {
    try {
      setLoadingDetail(true);
      setFormError("");
      setSuccessMessage("");

      const response = await getAdminAlbum(token, albumId);

      setForm(mapAlbumToForm(response.data.album));
      setFormMode("edit");
      setSelectedAlbumId(response.data.album.id);
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
        formMode === "edit" && selectedAlbumId
          ? await updateAdminAlbum(token, selectedAlbumId, payload)
          : await createAdminAlbum(token, payload);

      resetForm();
      setSuccessMessage(response.message);
      await Promise.all([loadAlbums(), loadArtists()]);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (album) => {
    const confirmed = window.confirm(
      `Hapus album "${album.title}" dari ${getArtistName(album)}? Tindakan ini tidak bisa dibatalkan.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(album.id);
      setError("");
      setSuccessMessage("");

      const response = await deleteAdminAlbum(token, album.id);

      setSuccessMessage(response.message);
      await loadAlbums();

      if (selectedAlbumId === album.id) {
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
      <div className="sf-admin-summary-grid" aria-label="Album summary">
        <article className="sf-admin-summary-card">
          <span>Total Albums</span>
          <strong>{albums.length}</strong>
        </article>

        <article className="sf-admin-summary-card">
          <span>Published Albums</span>
          <strong>{publishedAlbums}</strong>
        </article>
      </div>

      <div className="sf-admin-crud-grid">
        <section className="sf-admin-table-card">
          <div className="sf-admin-table-header sf-admin-table-header-row">
            <div>
              <p className="sf-eyebrow">Albums</p>

              <h2 className="sf-admin-table-title">Album list</h2>

              <p className="sf-admin-table-subtitle">
                Kelola album dan hubungkan setiap album dengan artist aktif.
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
            <div className="sf-admin-empty">Memuat data album...</div>
          ) : null}

          {!loading && !error && albums.length === 0 ? (
            <div className="sf-admin-empty">
              Belum ada album. Tambahkan album pertama dari form di samping.
            </div>
          ) : null}

          {!loading && !error && albums.length > 0 ? (
            <div className="sf-admin-table-wrap">
              <table className="sf-admin-table">
                <thead>
                  <tr>
                    <th>Album</th>
                    <th>Artist</th>
                    <th>Type</th>
                    <th>Release</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>

                <tbody>
                  {albums.map((album) => (
                    <tr key={album.id}>
                      <td>
                        <div className="sf-admin-artist-cell">
                          <span className="sf-admin-artist-avatar">
                            {getAlbumInitial(album)}
                          </span>

                          <div>
                            <strong>{album.title}</strong>
                            <small>{album.slug}</small>
                          </div>
                        </div>
                      </td>

                      <td>{getArtistName(album)}</td>

                      <td>{album.type.toUpperCase()}</td>

                      <td>{formatDate(album.releaseDate)}</td>

                      <td>
                        <span
                          className={
                            album.isPublished
                              ? "sf-admin-status active"
                              : "sf-admin-status inactive"
                          }
                        >
                          {album.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td>
                        <div className="sf-admin-row-actions">
                          <button
                            className="sf-admin-secondary-button"
                            type="button"
                            onClick={() => handleEdit(album.id)}
                            disabled={loadingDetail || deletingId === album.id}
                          >
                            Edit
                          </button>

                          <button
                            className="sf-admin-danger-button"
                            type="button"
                            onClick={() => handleDelete(album)}
                            disabled={deletingId === album.id}
                          >
                            {deletingId === album.id ? "Deleting..." : "Delete"}
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

        <aside className="sf-admin-form-card" aria-label="Album form">
          <div className="sf-admin-table-header">
            <p className="sf-eyebrow">
              {formMode === "edit" ? "Edit Album" : "New Album"}
            </p>

            <h2 className="sf-admin-table-title">
              {formMode === "edit" ? "Update album" : "Add album"}
            </h2>

            <p className="sf-admin-table-subtitle">
              Slug dibuat otomatis dari judul album dan dibuat unik per artist.
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
                placeholder="Contoh: Untuk Dunia, Cinta, dan Kotornya"
                minLength="2"
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
              <small>
                Dropdown hanya menampilkan artist dengan status aktif.
              </small>
            </label>

            <label>
              <span>Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Deskripsi singkat album"
                rows="5"
                maxLength="1200"
              />
            </label>

            <label>
              <span>Cover Image URL</span>
              <input
                type="url"
                name="coverImageUrl"
                value={form.coverImageUrl}
                onChange={handleChange}
                placeholder="https://example.com/cover.jpg"
              />
            </label>

            <label>
              <span>Release Date</span>
              <input
                type="date"
                name="releaseDate"
                value={form.releaseDate}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>Type</span>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="album">Album</option>
                <option value="ep">EP</option>
                <option value="single">Single</option>
              </select>
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

            <label className="sf-admin-checkbox">
              <input
                type="checkbox"
                name="isPublished"
                checked={form.isPublished}
                onChange={handleChange}
              />
              <span>Album sudah dipublikasikan</span>
            </label>

            <div className="sf-admin-form-actions">
              <button
                className="sf-admin-primary-button"
                type="submit"
                disabled={submitting || loadingDetail || activeArtists.length === 0}
              >
                {submitting ? "Saving..." : "Save album"}
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
                Buat atau aktifkan minimal satu artist sebelum menambahkan album.
              </small>
            ) : null}
          </form>
        </aside>
      </div>
    </section>
  );
}

export default AdminAlbumsPage;