import usePlayer from "../../hooks/usePlayer";

const formatDuration = (seconds) => {
  if (!seconds) {
    return "-";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const getSongImage = (song) => {
  return song.coverImageUrl || song.artist?.imageUrl || "";
};

function SongCard({ song }) {
  const { currentSong, isPlaying, isLoading, playSong, togglePlay } =
    usePlayer();
  const isCurrentSong = currentSong?.id === song.id;
  const songImage = getSongImage(song);

  const getButtonText = () => {
    if (isCurrentSong && isLoading) {
      return "…";
    }

    if (isCurrentSong && isPlaying) {
      return "Ⅱ";
    }

    return "▶";
  };

  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlay();
      return;
    }

    playSong(song);
  };

  return (
    <article className={`sf-music-card ${isCurrentSong ? "is-active" : ""}`}>
      <div className="sf-music-cover-wrap">
        {songImage ? (
          <img
            src={songImage}
            alt=""
            className="sf-music-cover"
            loading="lazy"
          />
        ) : (
          <span className="sf-music-cover-placeholder">
            {song.title.charAt(0).toUpperCase()}
          </span>
        )}

        <button
          type="button"
          className="sf-play-button"
          onClick={handlePlay}
          aria-label={`${isCurrentSong && isPlaying ? "Pause" : "Play"} ${song.title}`}
          aria-pressed={isCurrentSong && isPlaying}
        >
          {getButtonText()}
        </button>
      </div>

      <div className="sf-music-card-body">
        <h3>{song.title}</h3>
        <p>
          {song.artist?.name || "Unknown artist"}
          {song.album?.title ? ` • ${song.album.title}` : ""}
        </p>
        <span>{formatDuration(song.durationSeconds)}</span>
      </div>
    </article>
  );
}

export default SongCard;