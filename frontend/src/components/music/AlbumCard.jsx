import { Link } from "react-router";

const formatAlbumType = (type) => {
  return type ? type.toUpperCase() : "ALBUM";
};

function AlbumCard({ album }) {
  const albumDetailPath = album?.id ? `/albums/${album.id}` : "#";

  return (
    <Link
      to={albumDetailPath}
      className="sf-music-card sf-music-card-link"
      aria-label={`Buka detail album ${album.title}`}
    >
      <article>
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
    </Link>
  );
}

export default AlbumCard;