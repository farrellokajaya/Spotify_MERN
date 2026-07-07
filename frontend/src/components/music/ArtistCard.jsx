function ArtistCard({ artist }) {
  return (
    <article className="sf-music-card sf-artist-card">
      <div className="sf-music-cover-wrap sf-artist-cover-wrap">
        {artist.imageUrl ? (
          <img
            src={artist.imageUrl}
            alt=""
            className="sf-music-cover sf-artist-cover"
            loading="lazy"
          />
        ) : (
          <span className="sf-music-cover-placeholder sf-artist-cover-placeholder">
            {artist.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="sf-music-card-body">
        <h3>{artist.name}</h3>
        <p>
          {artist.genres?.length
            ? artist.genres.slice(0, 2).join(", ")
            : "Artist"}
        </p>
        <span>ARTIST</span>
      </div>
    </article>
  );
}

export default ArtistCard;