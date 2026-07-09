import { Loader2, Pause, Play, Trash2 } from "lucide-react";

import EmptyState from "../components/common/EmptyState";
import usePlayer from "../hooks/usePlayer";
import { formatDuration } from "../utils/format";
import { getSongImage } from "../utils/song";

function QueuePage() {
  const {
    currentSong,
    queueSongs,
    currentIndex,
    isPlaying,
    isLoading,
    playSongList,
    togglePlay,
    removeFromQueue,
    clearQueue,
  } = usePlayer();

  const waitingQueueSongs =
    currentIndex >= 0 ? queueSongs.slice(currentIndex + 1) : queueSongs;

  const hasQueue = Boolean(currentSong) || waitingQueueSongs.length > 0;

  const handlePlaySong = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }

    playSongList(queueSongs, song);
  };

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

  const renderSongRow = (song, index, label) => {
    const songImage = getSongImage(song);
    const isCurrentSong = currentSong?.id === song.id;

    return (
      <article
        key={song.id}
        className={`sf-playlist-song-row ${isCurrentSong ? "is-active" : ""}`}
      >
        <span className="sf-playlist-song-index">{label || index + 1}</span>

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
            onClick={() => handlePlaySong(song)}
            aria-label={`${isCurrentSong && isPlaying ? "Pause" : "Play"} ${song.title}`}
          >
            {renderPlayIcon(song)}
            <span>{isCurrentSong && isPlaying ? "Pause" : "Play"}</span>
          </button>

          <button
            type="button"
            className="sf-button sf-button-danger sf-button-with-icon"
            onClick={() => removeFromQueue(song.id)}
            aria-label={`Remove ${song.title} from queue`}
          >
            <Trash2 size={16} aria-hidden="true" />
            <span>Remove</span>
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="sf-browse-page sf-queue-page">
      <div className="sf-content-card sf-page-panel">
        <p className="sf-eyebrow">Queue</p>
        <h2 className="sf-page-title">Next Up</h2>

        <p className="sf-page-subtitle">
          Atur lagu yang sedang diputar dan daftar lagu berikutnya.
        </p>

        <div className="sf-button-row sf-library-actions">
          <button
            type="button"
            className="sf-button sf-button-secondary"
            onClick={clearQueue}
            disabled={!hasQueue}
          >
            Clear Queue
          </button>
        </div>
      </div>

      {!hasQueue ? (
        <EmptyState message="Queue masih kosong. Tambahkan lagu dari tombol Queue di SongCard atau putar lagu dari playlist." />
      ) : null}

      {currentSong ? (
        <div className="sf-content-card sf-playlist-song-list sf-queue-list">
          <div className="sf-queue-section-title">Now Playing</div>
          {renderSongRow(currentSong, 0, "Now")}
        </div>
      ) : null}

      {waitingQueueSongs.length > 0 ? (
        <div className="sf-content-card sf-playlist-song-list sf-queue-list">
          <div className="sf-queue-section-title">Up Next</div>
          {waitingQueueSongs.map((song, index) => renderSongRow(song, index))}
        </div>
      ) : null}
    </section>
  );
}

export default QueuePage;
