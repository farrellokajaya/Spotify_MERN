import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";

import useAuth from "../hooks/useAuth";
import usePlayer from "../hooks/usePlayer";
import {
  getPlaylistDetail,
  removeSongFromPlaylist,
} from "../services/api";

const initialDetail = {
  playlist: null,
};

const formatDuration = (seconds) => {
  const safeSeconds = Number(seconds);

  if (!Number.isFinite(safeSeconds) || safeSeconds <= 0) {
    return "-";
  }

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const getSongImage = (song) => {
  return song.coverImageUrl || song.album?.coverImageUrl || song.artist?.imageUrl || "";
};

const shuffleSongs = (songs) => {
  const shuffledSongs = [...songs];

  for (let index = shuffledSongs.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentSong = shuffledSongs[index];

    shuffledSongs[index] = shuffledSongs[randomIndex];
    shuffledSongs[randomIndex] = currentSong;
  }

  return shuffledSongs;
};

function PlaylistDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
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
    } finally {
      setLoading(false);
    }
  }, [id, token]);

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
    songs.forEach((song) => {
      addToQueue(song);
    });
  };

  const getPlayText = (song) => {
    const isCurrentSong = currentSong?.id === song.id;

    if (isCurrentSong && isLoading) {
      return "…";
    }

    if (isCurrentSong && isPlaying) {
      return "Pause";
    }

    return "Play";
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
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingId("");
    }
  };

  if (loading) {
    return <div className="sf-empty-panel">Memuat detail playlist...</div>;
  }

  if (error && !playlist) {
    return (
      <section className="sf-browse-page">
        <div className="sf-alert sf-alert-error" role="alert">
          {error}
        </div>

        <Link to="/playlists" className="sf-button sf-button-secondary sf-fit-button">
          Kembali ke Playlists
        </Link>
      </section>
    );
  }

  if (!playlist) {
    return (
      <section className="sf-browse-page">
        <div className="sf-empty-panel">Playlist tidak ditemukan.</div>

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
              className="sf-button sf-button-primary"
              onClick={handlePlayAll}
              disabled={!songs.length}
            >
              Play All
            </button>

            <button
              type="button"
              className="sf-button sf-button-secondary"
              onClick={handleShufflePlay}
              disabled={!songs.length}
            >
              Shuffle Play
            </button>

            <button
              type="button"
              className="sf-button sf-button-secondary"
              onClick={handleQueueAll}
              disabled={!songs.length}
            >
              Queue All
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="sf-alert sf-alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {songs.length === 0 ? (
        <div className="sf-empty-panel">
          Playlist ini belum memiliki song. Tambahkan lagu dari Home, Search,
          Artist Detail, Album Detail, atau Library dengan tombol +.
        </div>
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
                    className="sf-button sf-button-primary"
                    onClick={() => handlePlay(song)}
                  >
                    {getPlayText(song)}
                  </button>

                  <button
                    type="button"
                    className="sf-button sf-button-secondary"
                    onClick={() => handleAddToQueue(song)}
                  >
                    Queue
                  </button>

                  <button
                    type="button"
                    className="sf-button sf-button-danger"
                    onClick={() => handleRemoveSong(song)}
                    disabled={removingId === song.id}
                  >
                    {removingId === song.id ? "Removing..." : "Remove"}
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