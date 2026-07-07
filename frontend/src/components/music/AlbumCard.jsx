const formatAlbumType = (type) => {
  return type ? type.toUpperCase() : "ALBUM";
};

function AlbumCard({ album }) {
  return (
    <article className="sf-music-card">
      <div className="sf-music-cover-wrap">
        {album.coverImageUrl ? (
          <img
            src={album.coverImageUrl}
            alt=""
            className="sf-music-cover"
            loading="lazy"
          />
        ) : (
          <span className="sf-music-cover-placeholder">
            {album.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="sf-music-card-body">
        <h3>{album.title}</h3>
        <p>{album.artist?.name || "Unknown artist"}</p>
        <span>{formatAlbumType(album.type)}</span>
      </div>
    </article>
  );
}

export default AlbumCard;