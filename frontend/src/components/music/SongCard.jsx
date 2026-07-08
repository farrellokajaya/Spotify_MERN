import useFavorites from "../../hooks/useFavorites";
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
  return song.coverImageUrl || song.album?.coverImageUrl || song.artist?.imageUrl || "";
};

function SongCard({ song, onFavoriteRemoved }) {
  const { currentSong, isPlaying, isLoading, playSong, togglePlay } =
    usePlayer();
  const { isSongFavorite, isFavoritePending, toggleFavorite } = useFavorites();
  const isCurrentSong = currentSong?.id === song.id;
  const isFavorite = isSongFavorite(song.id);
  const favoritePending = isFavoritePending(song.id);
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

  const handleFavorite = async () => {
    try {
      const wasFavorite = isFavorite;

      await toggleFavorite(song);

      if (wasFavorite && onFavoriteRemoved) {
        onFavoriteRemoved(song.id);
      }
    } catch {
      // Error ditangani oleh FavoriteProvider agar UI tetap aman.
    }
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
          className={`sf-favorite-button ${isFavorite ? "is-liked" : ""}`}
          onClick={handleFavorite}
          disabled={favoritePending}
          aria-label={`${isFavorite ? "Remove from" : "Add to"} favorite songs`}
          aria-pressed={isFavorite}
        >
          {favoritePending ? "…" : "♥"}
        </button>

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