import {
  Loader2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import { Link } from "react-router";

import usePlayer from "../../hooks/usePlayer";
import { formatTime } from "../../utils/format";
import { getSongImage } from "../../utils/song";

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
  const buttonLabel = isLoading ? "Loading" : isPlaying ? "Pause" : "Play";
  const firstUpNextSong = upNextSongs[0];

  const renderMainButtonIcon = () => {
    if (isLoading) {
      return <Loader2 size={21} className="sf-spin-icon" aria-hidden="true" />;
    }

    if (isPlaying) {
      return <Pause size={21} fill="currentColor" aria-hidden="true" />;
    }

    return <Play size={22} fill="currentColor" aria-hidden="true" />;
  };

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
            className={`sf-player-button sf-player-icon-button ${isShuffle ? "is-active" : ""}`}
            onClick={toggleShuffle}
            aria-label={`${isShuffle ? "Disable" : "Enable"} shuffle`}
            aria-pressed={isShuffle}
          >
            <Shuffle size={17} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="sf-player-button sf-player-icon-button"
            onClick={playPrevious}
            aria-label="Play previous song"
          >
            <SkipBack size={18} fill="currentColor" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="sf-player-main-button"
            onClick={togglePlay}
            aria-label={`${buttonLabel} current song`}
          >
            {renderMainButtonIcon()}
          </button>

          <button
            type="button"
            className="sf-player-button sf-player-icon-button"
            onClick={playNext}
            aria-label="Play next song"
          >
            <SkipForward size={18} fill="currentColor" aria-hidden="true" />
          </button>

          <button
            type="button"
            className={`sf-player-button sf-player-icon-button ${isRepeat ? "is-active" : ""}`}
            onClick={toggleRepeat}
            aria-label={`${isRepeat ? "Disable" : "Enable"} repeat queue`}
            aria-pressed={isRepeat}
          >
            <Repeat size={17} aria-hidden="true" />
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
        <X size={18} aria-hidden="true" />
      </button>
    </aside>
  );
}

export default PlayerBar;
