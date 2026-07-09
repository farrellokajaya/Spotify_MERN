import { ListPlus, Loader2, Pause, Play, Shuffle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";

import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import useAuth from "../hooks/useAuth";
import usePlayer from "../hooks/usePlayer";
import useToast from "../hooks/useToast";
import {
  getPlaylistDetail,
  removeSongFromPlaylist,
} from "../services/api";
import { formatDuration } from "../utils/format";
import { shuffleSongs } from "../utils/player";
import { getSongImage } from "../utils/song";

const initialDetail = {
  playlist: null,
};

function PlaylistDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const toast = useToast();
  const {
    currentSong,
    isPlaying,
    isLoading,
    playSong,
    playSongList,
    togglePlay,
    addToQueue,
  } = usePlayer();

  const [detail, setDetail] = useState(initialDetail);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");

  const playlist = detail.playlist;
  const songs = useMemo(() => playlist?.songs || [], [playlist]);

  const loadPlaylistDetail = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getPlaylistDetail(token, id);

      setDetail(response.data || initialDetail);
    } catch (err) {
      setError(err.message);
      setDetail(initialDetail);
      toast.error(err.message || "Gagal memuat detail playlist.");
    } finally {
      setLoading(false);
    }
  }, [id, toast, token]);

  useEffect(() => {
    let ignore = false;

    Promise.resolve().then(() => {
      if (!ignore) {
        loadPlaylistDetail();
      }
    });

    return () => {
      ignore = true;
    };
  }, [loadPlaylistDetail]);

  const renderPlayIcon = (song) => {
    const isCurrentSong = currentSong?.id === song.id;

    if (isCurrentSong && isLoading) {
      return <Loader2 size={16} className="sf-spin-icon" aria-hidden="true" />;
    }

    if (isCurrentSong && isPlaying) {
      return <Pause size={16} fill="currentColor" aria-hidden="true" />;
    }

    return <Play size={16} fill="currentColor" aria-hidden="true" />;
  };

  const handlePlay = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }

    if (songs.length > 0) {
      playSongList(songs, song);
      return;
    }

    playSong(song);
  };

  const handlePlayAll = () => {
    if (!songs.length) {
      return;
    }

    playSongList(songs, songs[0]);
  };

  const handleShufflePlay = () => {
    if (!songs.length) {
      return;
    }

    const shuffledSongs = shuffleSongs(songs);

    playSongList(shuffledSongs, shuffledSongs[0]);
  };

  const handleAddToQueue = (song) => {
    addToQueue(song);
  };

  const handleQueueAll = () => {
    let addedCount = 0;

    songs.forEach((song) => {
      const added = addToQueue(song);

      if (added) {
        addedCount += 1;
      }
    });

    if (addedCount === 0) {
      toast.info("Semua song sudah ada di queue.");
    }
  };

  const handleRemoveSong = async (song) => {
    try {
      setRemovingId(song.id);
      setError("");

      await removeSongFromPlaylist(token, id, song.id);

      setDetail((currentDetail) => {
        const currentPlaylist = currentDetail.playlist;

        if (!currentPlaylist) {
          return currentDetail;
        }

        return {
          playlist: {
            ...currentPlaylist,
            songs: currentPlaylist.songs.filter((currentSongItem) => {
              return currentSongItem.id !== song.id;
            }),
            songCount: Math.max(Number(currentPlaylist.songCount || 1) - 1, 0),
          },
        };
      });

      toast.success(`${song.title} dihapus dari playlist.`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Gagal menghapus song dari playlist.");
    } finally {
      setRemovingId("");
    }
  };

  if (loading) {
    return <LoadingState message="Memuat detail playlist..." />;
  }

  if (error && !playlist) {
    return (
      <section className="sf-browse-page">
        <ErrorState message={error} />

        <Link to="/playlists" className="sf-button sf-button-secondary sf-fit-button">
          Kembali ke Playlists
        </Link>
      </section>
    );
  }

  if (!playlist) {
    return (
      <section className="sf-browse-page">
        <EmptyState message="Playlist tidak ditemukan." />

        <Link to="/playlists" className="sf-button sf-button-secondary sf-fit-button">
          Kembali ke Playlists
        </Link>
      </section>
    );
  }

  return (
    <section className="sf-browse-page">
      <div className="sf-content-card sf-playlist-detail-hero">
        <div className="sf-playlist-detail-cover">
          {playlist.name.charAt(0).toUpperCase()}
        </div>

        <div className="sf-detail-copy">
          <p className="sf-eyebrow">Playlist</p>
          <h2 className="sf-detail-title">{playlist.name}</h2>
          <p className="sf-detail-description">
            {playlist.description || "Playlist pribadi tanpa deskripsi."}
          </p>

          <div className="sf-detail-meta-row">
            <span>{songs.length} song</span>
            <Link to="/playlists" className="sf-detail-link">
              Back to Playlists
            </Link>
          </div>

          <div className="sf-button-row sf-playlist-hero-actions">
            <button
              type="button"
              className="sf-button sf-button-primary sf-button-with-icon"
              onClick={handlePlayAll}
              disabled={!songs.length}
              aria-label={`Play all songs from ${playlist.name}`}
            >
              <Play size={16} fill="currentColor" aria-hidden="true" />
              <span>Play All</span>
            </button>

            <button
              type="button"
              className="sf-button sf-button-secondary sf-button-with-icon"
              onClick={handleShufflePlay}
              disabled={!songs.length}
              aria-label={`Shuffle play ${playlist.name}`}
            >
              <Shuffle size={16} aria-hidden="true" />
              <span>Shuffle Play</span>
            </button>

            <button
              type="button"
              className="sf-button sf-button-secondary sf-button-with-icon"
              onClick={handleQueueAll}
              disabled={!songs.length}
              aria-label={`Add all songs from ${playlist.name} to queue`}
            >
              <ListPlus size={16} aria-hidden="true" />
              <span>Queue All</span>
            </button>
          </div>
        </div>
      </div>

      <ErrorState message={error} />

      {songs.length === 0 ? (
        <EmptyState message="Playlist ini belum memiliki song. Tambahkan lagu dari Home, Search, Artist Detail, Album Detail, atau Library dengan tombol Add to playlist." />
      ) : (
        <div className="sf-content-card sf-playlist-song-list">
          {songs.map((song, index) => {
            const songImage = getSongImage(song);
            const isCurrentSong = currentSong?.id === song.id;

            return (
              <article
                key={song.id}
                className={`sf-playlist-song-row ${isCurrentSong ? "is-active" : ""}`}
              >
                <span className="sf-playlist-song-index">{index + 1}</span>

                <div className="sf-playlist-song-cover">
                  {songImage ? (
                    <img src={songImage} alt="" loading="lazy" />
                  ) : (
                    <span>{song.title.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="sf-playlist-song-copy">
                  <h3>{song.title}</h3>
                  <p>
                    {song.artist?.name || "Unknown artist"}
                    {song.album?.title ? ` • ${song.album.title}` : ""}
                  </p>
                </div>

                <span className="sf-playlist-song-duration">
                  {formatDuration(song.durationSeconds)}
                </span>

                <div className="sf-button-row sf-playlist-song-actions">
                  <button
                    type="button"
                    className="sf-button sf-button-primary sf-button-with-icon"
                    onClick={() => handlePlay(song)}
                    aria-label={`${isCurrentSong && isPlaying ? "Pause" : "Play"} ${song.title}`}
                  >
                    {renderPlayIcon(song)}
                    <span>{isCurrentSong && isPlaying ? "Pause" : "Play"}</span>
                  </button>

                  <button
                    type="button"
                    className="sf-button sf-button-secondary sf-button-with-icon"
                    onClick={() => handleAddToQueue(song)}
                    aria-label={`Add ${song.title} to queue`}
                  >
                    <ListPlus size={16} aria-hidden="true" />
                    <span>Queue</span>
                  </button>

                  <button
                    type="button"
                    className="sf-button sf-button-danger sf-button-with-icon"
                    onClick={() => handleRemoveSong(song)}
                    disabled={removingId === song.id}
                    aria-label={`Remove ${song.title} from playlist`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    <span>{removingId === song.id ? "Removing..." : "Remove"}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PlaylistDetailPage;
