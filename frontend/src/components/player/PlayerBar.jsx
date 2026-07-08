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
    currentTime,
    duration,
    error,
    togglePlay,
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
        <button
          type="button"
          className="sf-player-main-button"
          onClick={togglePlay}
          aria-label={`${buttonLabel} current song`}
        >
          {buttonText}
        </button>

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