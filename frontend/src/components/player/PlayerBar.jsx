import usePlayer from "../../hooks/usePlayer";

const formatDuration = (seconds) => {
  if (!seconds) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const getSongImage = (song) => {
  return song?.coverImageUrl || song?.artist?.imageUrl || "";
};

function PlayerBar() {
  const { currentSong, isPlaying, togglePlay, clearPlayer } = usePlayer();

  if (!currentSong) {
    return null;
  }

  const songImage = getSongImage(currentSong);

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

      <div className="sf-player-controls">
        <button
          type="button"
          className="sf-player-button primary"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause song" : "Play song"}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <span className="sf-player-duration">
          {formatDuration(currentSong.durationSeconds)}
        </span>
      </div>

      <button
        type="button"
        className="sf-player-button"
        onClick={clearPlayer}
        aria-label="Close player"
      >
        Close
      </button>
    </aside>
  );
}

export default PlayerBar;