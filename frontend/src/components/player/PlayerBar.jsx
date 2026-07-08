import { Link } from "react-router";

import usePlayer from "../../hooks/usePlayer";

const formatTime = (seconds) => {
  const safeSeconds = Number(seconds);

  if (!Number.isFinite(safeSeconds) || safeSeconds <= 0) {
    return "0:00";
  }

  const roundedSeconds = Math.floor(safeSeconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const getSongImage = (song) => {
  return (
    song?.imageUrl ||
    song?.coverImageUrl ||
    song?.album?.coverImageUrl ||
    song?.album?.imageUrl ||
    song?.artist?.imageUrl ||
    ""
  );
};

function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    isLoading,
    isShuffle,
    isRepeat,
    upNextSongs,
    currentTime,
    duration,
    error,
    togglePlay,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    seekTo,
    clearPlayer,
  } = usePlayer();

  if (!currentSong) {
    return null;
  }

  const songImage = getSongImage(currentSong);
  const progressValue = duration > 0 ? Math.min(currentTime, duration) : 0;
  const canSeek = duration > 0 && !isLoading && !error;
  const buttonText = isLoading ? "…" : isPlaying ? "Ⅱ" : "▶";
  const buttonLabel = isLoading ? "Loading" : isPlaying ? "Pause" : "Play";
  const firstUpNextSong = upNextSongs[0];

  return (
    <aside className="sf-player-bar" aria-label="Now playing">
      <div className="sf-player-song">
        {songImage ? (
          <img src={songImage} alt="" className="sf-player-cover" />
        ) : (
          <span className="sf-player-cover-placeholder">
            {currentSong.title.charAt(0).toUpperCase()}
          </span>
        )}

        <div className="sf-player-meta">
          <strong>{currentSong.title}</strong>
          <span>
            {currentSong.artist?.name || "Unknown artist"}
            {currentSong.album?.title ? ` • ${currentSong.album.title}` : ""}
          </span>
        </div>
      </div>

      <div className="sf-player-center">
        <div className="sf-player-controls">
          <button
            type="button"
            className={`sf-player-button ${isShuffle ? "is-active" : ""}`}
            onClick={toggleShuffle}
            aria-label={`${isShuffle ? "Disable" : "Enable"} shuffle`}
            aria-pressed={isShuffle}
          >
            Shuffle
          </button>

          <button
            type="button"
            className="sf-player-button"
            onClick={playPrevious}
            aria-label="Play previous song"
          >
            ‹‹
          </button>

          <button
            type="button"
            className="sf-player-main-button"
            onClick={togglePlay}
            aria-label={`${buttonLabel} current song`}
          >
            {buttonText}
          </button>

          <button
            type="button"
            className="sf-player-button"
            onClick={playNext}
            aria-label="Play next song"
          >
            ››
          </button>

          <button
            type="button"
            className={`sf-player-button ${isRepeat ? "is-active" : ""}`}
            onClick={toggleRepeat}
            aria-label={`${isRepeat ? "Disable" : "Enable"} repeat queue`}
            aria-pressed={isRepeat}
          >
            Repeat
          </button>
        </div>

        <div className="sf-player-progress-row">
          <span className="sf-player-time">{formatTime(currentTime)}</span>

          <input
            type="range"
            className="sf-player-progress"
            min="0"
            max={duration || 0}
            step="1"
            value={progressValue}
            disabled={!canSeek}
            onChange={(event) => seekTo(event.target.value)}
            aria-label={`Seek ${currentSong.title}`}
          />

          <span className="sf-player-time">{formatTime(duration)}</span>
        </div>

        {firstUpNextSong ? (
          <Link to="/queue" className="sf-player-up-next">
            Up Next: {firstUpNextSong.title}
          </Link>
        ) : (
          <Link to="/queue" className="sf-player-up-next sf-player-up-next-muted">
            Queue kosong
          </Link>
        )}

        {error ? (
          <p className="sf-player-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        className="sf-player-close-button"
        onClick={clearPlayer}
        aria-label="Close player and stop audio"
      >
        ×
      </button>
    </aside>
  );
}

export default PlayerBar;