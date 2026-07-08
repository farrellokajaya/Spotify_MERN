import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";

import useAuth from "../../hooks/useAuth";
import { addSongToPlaylist, getUserPlaylists } from "../../services/api";

function AddToPlaylistButton({ song }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    if (!open || !token) {
      return () => {
        ignore = true;
      };
    }

    const loadPlaylists = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccessMessage("");

        const response = await getUserPlaylists(token);

        if (!ignore) {
          setPlaylists(response.data?.playlists || []);
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

    loadPlaylists();

    return () => {
      ignore = true;
    };
  }, [open, token]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.classList.add("sf-modal-open");
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.classList.remove("sf-modal-open");
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleOpen = (event) => {
    event.stopPropagation();
    setOpen(true);
  };

  const handleClose = (event) => {
    if (event) {
      event.stopPropagation();
    }

    setOpen(false);
    setError("");
    setSuccessMessage("");
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!token || !song?.id) {
      return;
    }

    try {
      setSubmittingId(playlistId);
      setError("");
      setSuccessMessage("");

      await addSongToPlaylist(token, playlistId, song.id);

      setSuccessMessage("Song berhasil ditambahkan ke playlist.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingId("");
    }
  };

  const modal = open ? (
    <div
      className="sf-modal-backdrop"
      role="presentation"
      onClick={handleClose}
    >
      <div
        className="sf-modal-card sf-playlist-picker"
        role="dialog"
        aria-modal="true"
        aria-label="Add song to playlist"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sf-modal-header">
          <div>
            <p className="sf-eyebrow">Playlist</p>
            <h2>Add to playlist</h2>
            <p>{song.title}</p>
          </div>

          <button
            type="button"
            className="sf-icon-button"
            onClick={handleClose}
            aria-label="Close playlist modal"
          >
            ×
          </button>
        </div>

        {error ? (
          <div className="sf-alert sf-alert-error" role="alert">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="sf-alert sf-alert-success" role="status">
            {successMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="sf-empty-panel">Memuat playlist...</div>
        ) : null}

        {!loading && playlists.length === 0 ? (
          <div className="sf-empty-panel">
            Belum ada playlist. Buat playlist dulu dari halaman{" "}
            <Link to="/playlists" onClick={() => setOpen(false)}>
              Playlists
            </Link>
            .
          </div>
        ) : null}

        {!loading && playlists.length > 0 ? (
          <div className="sf-playlist-picker-list">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                type="button"
                className="sf-playlist-picker-item"
                onClick={() => handleAddToPlaylist(playlist.id)}
                disabled={submittingId === playlist.id}
              >
                <span>{playlist.name}</span>
                <small>{playlist.songCount} song</small>
                <strong>
                  {submittingId === playlist.id ? "Adding..." : "Add"}
                </strong>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        className="sf-add-playlist-button"
        onClick={handleOpen}
        aria-label={`Add ${song.title} to playlist`}
      >
        +
      </button>

      {modal ? createPortal(modal, document.body) : null}
    </>
  );
}

export default AddToPlaylistButton;