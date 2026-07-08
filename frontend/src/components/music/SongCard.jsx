import { Heart, ListPlus, Loader2, Pause, Play } from "lucide-react";

import AddToPlaylistButton from "./AddToPlaylistButton";
import useFavorites from "../../hooks/useFavorites";
import usePlayer from "../../hooks/usePlayer";
import { formatDuration } from "../../utils/format";
import { getSongImage } from "../../utils/song";

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

  const renderPlayIcon = () => {
    if (isCurrentSong && isLoading) {
      return <Loader2 size={17} className="sf-spin-icon" aria-hidden="true" />;
    }

    if (isCurrentSong && isPlaying) {
      return <Pause size={17} fill="currentColor" aria-hidden="true" />;
    }

    return <Play size={18} fill="currentColor" aria-hidden="true" />;
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
          {favoritePending ? (
            <Loader2 size={16} className="sf-spin-icon" aria-hidden="true" />
          ) : (
            <Heart
              size={16}
              fill={isFavorite ? "currentColor" : "none"}
              aria-hidden="true"
            />
          )}
        </button>

        <button
          type="button"
          className="sf-add-queue-button"
          onClick={handleAddToQueue}
          aria-label={`Add ${song.title} to queue`}
        >
          <ListPlus size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="sf-play-button"
          onClick={handlePlayButton}
          aria-label={`${isCurrentSong && isPlaying ? "Pause" : "Play"} ${song.title}`}
          aria-pressed={isCurrentSong && isPlaying}
        >
          {renderPlayIcon()}
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