import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";

import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import IconButton from "../common/IconButton";
import LoadingState from "../common/LoadingState";
import useAuth from "../../hooks/useAuth";
import useToast from "../../hooks/useToast";
import { addSongToPlaylist, getUserPlaylists } from "../../services/api";

function AddToPlaylistButton({ song }) {
  const { token } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState("");
  const [error, setError] = useState("");

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

        const response = await getUserPlaylists(token);

        if (!ignore) {
          setPlaylists(response.data?.playlists || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          toast.error(err.message || "Gagal memuat playlist.");
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
  }, [open, toast, token]);

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

    if (!token) {
      toast.info("Login untuk menambahkan lagu ke playlist.");
      return;
    }

    setOpen(true);
    setError("");
  };

  const handleClose = (event) => {
    if (event) {
      event.stopPropagation();
    }

    setOpen(false);
    setError("");
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!token || !song?.id) {
      toast.error("Song tidak valid dan gagal ditambahkan ke playlist.");
      return;
    }

    try {
      setSubmittingId(playlistId);
      setError("");

      await addSongToPlaylist(token, playlistId, song.id);

      toast.success(`${song.title} berhasil ditambahkan ke playlist.`);
      setOpen(false);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Gagal menambahkan song ke playlist.");
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

          <IconButton icon={X} label="Close playlist modal" onClick={handleClose} />
        </div>

        <ErrorState message={error} />

        {loading ? <LoadingState message="Memuat playlist..." /> : null}

        {!loading && playlists.length === 0 ? (
          <EmptyState>
            Belum ada playlist. Buat playlist dulu dari halaman{" "}
            <Link to="/playlists" onClick={() => setOpen(false)}>
              Playlists
            </Link>
            .
          </EmptyState>
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
        title="Add to playlist"
      >
        <Plus size={17} aria-hidden="true" />
      </button>

      {modal ? createPortal(modal, document.body) : null}
    </>
  );
}

export default AddToPlaylistButton;
