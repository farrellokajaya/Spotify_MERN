import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import {
  createPlaylist,
  deletePlaylist,
  getUserPlaylists,
  updatePlaylist,
} from "../services/api";

const initialForm = {
  name: "",
  description: "",
};

function PlaylistPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState(initialForm);

  const loadPlaylists = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getUserPlaylists(token);

      setPlaylists(response.data?.playlists || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Gagal memuat playlist.");
    } finally {
      setLoading(false);
    }
  }, [toast, token]);

  useEffect(() => {
    let ignore = false;

    Promise.resolve().then(() => {
      if (!ignore) {
        loadPlaylists();
      }
    });

    return () => {
      ignore = true;
    };
  }, [loadPlaylists]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await createPlaylist(token, {
        name: form.name,
        description: form.description,
      });

      setPlaylists((currentPlaylists) => [
        response.data.playlist,
        ...currentPlaylists,
      ]);

      setForm(initialForm);
      toast.success("Playlist berhasil dibuat.");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Gagal membuat playlist.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (playlist) => {
    setEditingId(playlist.id);
    setEditForm({
      name: playlist.name || "",
      description: playlist.description || "",
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditForm(initialForm);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleUpdate = async (playlistId) => {
    try {
      setSubmitting(true);
      setError("");

      const response = await updatePlaylist(token, playlistId, {
        name: editForm.name,
        description: editForm.description,
      });

      setPlaylists((currentPlaylists) =>
        currentPlaylists.map((playlist) => {
          if (playlist.id === playlistId) {
            return response.data.playlist;
          }

          return playlist;
        }),
      );

      cancelEdit();
      toast.success("Playlist berhasil diperbarui.");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Gagal memperbarui playlist.");
    } finally {
      setSubmitting(false);
    }
  };

  const isEditInvalid = editForm.name.trim().length < 2;

  const handleDelete = async (playlist) => {
    const confirmed = window.confirm(
      `Hapus playlist "${playlist.name}"? Lagu tidak ikut terhapus dari database.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await deletePlaylist(token, playlist.id);

      setPlaylists((currentPlaylists) =>
        currentPlaylists.filter((currentPlaylist) => {
          return currentPlaylist.id !== playlist.id;
        }),
      );

      toast.success("Playlist berhasil dihapus.");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Gagal menghapus playlist.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="sf-browse-page sf-playlist-page">
      <div className="sf-content-card sf-playlist-create-card">
        <div className="sf-playlist-create-copy">
          <p className="sf-eyebrow">Create Playlist</p>
          <h2>New playlist</h2>
          <p>
            Buat playlist pribadi, lalu tambahkan lagu dari Home, Search,
            Artist Detail, Album Detail, atau Library.
          </p>
        </div>

        <form className="sf-playlist-create-form" onSubmit={handleCreate}>
          <div className="sf-form-field">
            <label htmlFor="playlist-name">Playlist name</label>
            <input
              id="playlist-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Chill Night"
              minLength="2"
              maxLength="80"
              required
            />
          </div>

          <div className="sf-form-field">
            <label htmlFor="playlist-description">Description</label>
            <textarea
              id="playlist-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Opsional"
              maxLength="500"
              rows="3"
            />
          </div>

          <button
            type="submit"
            className="sf-button sf-button-primary sf-playlist-submit"
            disabled={submitting || form.name.trim().length < 2}
          >
            {submitting ? "Saving..." : "Create Playlist"}
          </button>
        </form>
      </div>

      <div className="sf-playlist-section-head">
        <div>
          <p className="sf-eyebrow">Your Collection</p>
          <h2>{playlists.length} playlist</h2>
        </div>
      </div>

      <ErrorState message={error} />

      {loading ? <LoadingState message="Memuat playlist..." /> : null}

      {!loading && !error && playlists.length === 0 ? (
        <EmptyState message="Belum ada playlist. Buat playlist pertama kamu dari form di atas." />
      ) : null}

      {!loading && playlists.length > 0 ? (
        <div className="sf-playlist-list">
          {playlists.map((playlist) => (
            <article key={playlist.id} className="sf-content-card sf-playlist-list-item">
              {editingId === playlist.id ? (
                <div className="sf-playlist-edit-panel">
                  <div className="sf-form-field">
                    <label htmlFor={`edit-name-${playlist.id}`}>
                      Playlist name
                    </label>
                    <input
                      id={`edit-name-${playlist.id}`}
                      name="name"
                      type="text"
                      value={editForm.name}
                      onChange={handleEditChange}
                      minLength="2"
                      maxLength="80"
                    />
                  </div>

                  <div className="sf-form-field">
                    <label htmlFor={`edit-description-${playlist.id}`}>
                      Description
                    </label>
                    <textarea
                      id={`edit-description-${playlist.id}`}
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      placeholder="Opsional"
                      maxLength="500"
                      rows="3"
                    />
                  </div>

                  <div className="sf-button-row">
                    <button
                      type="button"
                      className="sf-button sf-button-primary"
                      onClick={() => handleUpdate(playlist.id)}
                      disabled={submitting || isEditInvalid}
                    >
                      {submitting ? "Saving..." : "Save"}
                    </button>

                    <button
                      type="button"
                      className="sf-button sf-button-secondary"
                      onClick={cancelEdit}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    to={`/playlists/${playlist.id}`}
                    className="sf-playlist-list-link"
                  >
                    <span className="sf-playlist-list-cover">
                      {playlist.name.charAt(0).toUpperCase()}
                    </span>

                    <div className="sf-playlist-list-copy">
                      <h3>{playlist.name}</h3>
                      <p>{playlist.description || "Tidak ada deskripsi."}</p>
                      <small>{playlist.songCount} song</small>
                    </div>
                  </Link>

                  <div className="sf-button-row sf-playlist-list-actions">
                    <button
                      type="button"
                      className="sf-button sf-button-secondary sf-button-with-icon"
                      onClick={() => startEdit(playlist)}
                      disabled={submitting}
                      aria-label={`Edit playlist ${playlist.name}`}
                    >
                      <Pencil size={16} aria-hidden="true" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className="sf-button sf-button-danger sf-button-with-icon"
                      onClick={() => handleDelete(playlist)}
                      disabled={submitting}
                      aria-label={`Delete playlist ${playlist.name}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default PlaylistPage;
