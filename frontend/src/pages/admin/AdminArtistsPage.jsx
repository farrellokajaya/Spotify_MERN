import { useEffect, useMemo, useState } from "react";
import MediaUploadField from "../../components/admin/MediaUploadField";

import useAuth from "../../hooks/useAuth";
import {
  createAdminArtist,
  deleteAdminArtist,
  getAdminArtist,
  getAdminArtists,
  updateAdminArtist,
} from "../../services/api";

const initialForm = {
  name: "",
  bio: "",
  imageUrl: "",
  genres: "",
  isActive: true,
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

const getArtistInitial = (artist) => {
  return (artist.name || "A").charAt(0).toUpperCase();
};

const mapArtistToForm = (artist) => ({
  name: artist.name || "",
  bio: artist.bio || "",
  imageUrl: artist.imageUrl || "",
  genres: Array.isArray(artist.genres) ? artist.genres.join(", ") : "",
  isActive: Boolean(artist.isActive),
});

const mapFormToPayload = (form) => ({
  name: form.name.trim(),
  bio: form.bio.trim(),
  imageUrl: form.imageUrl.trim(),
  genres: form.genres
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean),
  isActive: form.isActive,
});

function AdminArtistsPage() {
  const { token } = useAuth();

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState(initialForm);
  const [formMode, setFormMode] = useState("create");
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const totalArtists = artists.length;

  const activeArtists = useMemo(() => {
    return artists.filter((artist) => artist.isActive).length;
  }, [artists]);

  const loadArtists = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminArtists(token);
      setArtists(response.data.artists);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const fetchInitialArtists = async () => {
      try {
        const response = await getAdminArtists(token);

        if (!ignore) {
          setArtists(response.data.artists);
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

    fetchInitialArtists();

    return () => {
      ignore = true;
    };
  }, [token]);

  const resetForm = () => {
    setForm(initialForm);
    setFormMode("create");
    setSelectedArtistId(null);
    setFormError("");
    setSuccessMessage("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = async (artistId) => {
    try {
      setLoadingDetail(true);
      setFormError("");
      setSuccessMessage("");

      const response = await getAdminArtist(token, artistId);

      setForm(mapArtistToForm(response.data.artist));
      setFormMode("edit");
      setSelectedArtistId(response.data.artist.id);
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

      if (formMode === "edit" && selectedArtistId) {
        const response = await updateAdminArtist(
          token,
          selectedArtistId,
          payload,
        );

        setSuccessMessage(response.message);
      } else {
        const response = await createAdminArtist(token, payload);

        setSuccessMessage(response.message);
      }

      resetForm();
      await loadArtists();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (artist) => {
    const confirmed = window.confirm(
      `Hapus artist "${artist.name}"? Tindakan ini tidak bisa dibatalkan.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(artist.id);
      setError("");
      setSuccessMessage("");

      const response = await deleteAdminArtist(token, artist.id);

      setSuccessMessage(response.message);
      await loadArtists();

      if (selectedArtistId === artist.id) {
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
      <div className="sf-admin-summary-grid" aria-label="Artist summary">
        <article className="sf-admin-summary-card">
          <span>Total Artists</span>
          <strong>{totalArtists}</strong>
        </article>

        <article className="sf-admin-summary-card">
          <span>Active Artists</span>
          <strong>{activeArtists}</strong>
        </article>
      </div>

      <div className="sf-admin-crud-grid">
        <section className="sf-admin-table-card">
          <div className="sf-admin-table-header sf-admin-table-header-row">
            <div>
              <p className="sf-eyebrow">Artists</p>

              <h2 className="sf-admin-table-title">Artist list</h2>

              <p className="sf-admin-table-subtitle">
                Kelola data artist yang nanti akan digunakan oleh album dan
                lagu.
              </p>
            </div>

            <button
              className="sf-admin-secondary-button"
              type="button"
              onClick={loadArtists}
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
            <div className="sf-admin-empty">Memuat data artist...</div>
          ) : null}

          {!loading && !error && artists.length === 0 ? (
            <div className="sf-admin-empty">
              Belum ada artist. Tambahkan artist pertama dari form di samping.
            </div>
          ) : null}

          {!loading && !error && artists.length > 0 ? (
            <div className="sf-admin-table-wrap">
              <table className="sf-admin-table">
                <thead>
                  <tr>
                    <th>Artist</th>
                    <th>Genres</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>

                <tbody>
                  {artists.map((artist) => (
                    <tr key={artist.id}>
                      <td>
                        <div className="sf-admin-artist-cell">
                          <span className="sf-admin-artist-avatar">
                            {getArtistInitial(artist)}
                          </span>

                          <div>
                            <strong>{artist.name}</strong>
                            <small>{artist.slug}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {artist.genres.length > 0 ? (
                          <div className="sf-admin-tags">
                            {artist.genres.map((genre) => (
                              <span key={genre}>{genre}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="sf-admin-muted">-</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            artist.isActive
                              ? "sf-admin-status active"
                              : "sf-admin-status inactive"
                          }
                        >
                          {artist.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>{formatDate(artist.createdAt)}</td>

                      <td>
                        <div className="sf-admin-row-actions">
                          <button
                            className="sf-admin-secondary-button"
                            type="button"
                            onClick={() => handleEdit(artist.id)}
                            disabled={loadingDetail || deletingId === artist.id}
                          >
                            Edit
                          </button>

                          <button
                            className="sf-admin-danger-button"
                            type="button"
                            onClick={() => handleDelete(artist)}
                            disabled={deletingId === artist.id}
                          >
                            {deletingId === artist.id ? "Deleting..." : "Delete"}
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

        <aside className="sf-admin-form-card" aria-label="Artist form">
          <div className="sf-admin-table-header">
            <p className="sf-eyebrow">
              {formMode === "edit" ? "Edit Artist" : "New Artist"}
            </p>

            <h2 className="sf-admin-table-title">
              {formMode === "edit" ? "Update artist" : "Add artist"}
            </h2>

            <p className="sf-admin-table-subtitle">
              Slug dibuat otomatis dari nama artist dan dijaga tetap unik.
            </p>
          </div>

          {formError ? (
            <div className="sf-admin-alert sf-admin-alert-error" role="alert">
              {formError}
            </div>
          ) : null}

          <form className="sf-admin-form" onSubmit={handleSubmit}>
            <label>
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Nadin Amizah"
                minLength="2"
                maxLength="80"
                required
              />
            </label>

            <label>
              <span>Bio</span>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Bio singkat artist"
                rows="5"
                maxLength="1000"
              />
            </label>

            <label>
              <span>Image URL</span>
              <MediaUploadField
                label="Artist Image"
                type="image"
                value={form.imageUrl}
                onChange={(url) =>
                  setForm((prev) => ({
                    ...prev,
                    imageUrl: url,
                  }))
                  }
                  placeholder="Masukkan imageUrl artist atau upload image"
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

            <label className="sf-admin-checkbox">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
              <span>Artist aktif dan dapat digunakan</span>
            </label>

            <div className="sf-admin-form-actions">
              <button
                className="sf-admin-primary-button"
                type="submit"
                disabled={submitting || loadingDetail}
              >
                {submitting ? "Saving..." : "Save artist"}
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
          </form>
        </aside>
      </div>
    </section>
  );
}

export default AdminArtistsPage;