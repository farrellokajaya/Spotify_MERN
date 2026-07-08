import AddToPlaylistButton from "./AddToPlaylistButton";
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

function SongCard({ song, songs = [], metaText, onFavoriteRemoved }) {
  const {
    currentSong,
    isPlaying,
    isLoading,
    playSong,
    playSongList,
    togglePlay,
    addToQueue,
  } = usePlayer();
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

    if (songs.length > 0) {
      playSongList(songs, song);
      return;
    }

    playSong(song);
  };

  const handleCardKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handlePlay();
  };

  const handlePlayButton = (event) => {
    event.stopPropagation();
    handlePlay();
  };

  const handleFavorite = async (event) => {
    event.stopPropagation();

    try {
      const wasFavorite = isFavorite;

      await toggleFavorite(song);

      if (wasFavorite && onFavoriteRemoved) {
        onFavoriteRemoved(song.id);
      }
    } catch {
      return;
    }
  };

  const handleAddToQueue = (event) => {
    event.stopPropagation();
    addToQueue(song);
  };

  return (
    <article
      className={`sf-music-card sf-music-card-clickable ${
        isCurrentSong ? "is-active" : ""
      }`}
      onClick={handlePlay}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex="0"
      aria-label={`${isCurrentSong && isPlaying ? "Pause" : "Play"} ${song.title}`}
    >
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

        <AddToPlaylistButton song={song} />

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
          className="sf-add-queue-button"
          onClick={handleAddToQueue}
          aria-label={`Add ${song.title} to queue`}
        >
          ⇥
        </button>

        <button
          type="button"
          className="sf-play-button"
          onClick={handlePlayButton}
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
        <span>{metaText || formatDuration(song.durationSeconds)}</span>
      </div>
    </article>
  );
}

export default SongCard;