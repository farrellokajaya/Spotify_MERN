import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import MusicSection from "../components/music/MusicSection";
import SongCard from "../components/music/SongCard";
import { getPublicAlbumDetail } from "../services/api";

const initialAlbumDetail = {
  album: null,
  songs: [],
};

const getAlbumInitial = (album) => {
  return album?.title?.charAt(0)?.toUpperCase() || "A";
};

const formatAlbumType = (type) => {
  return type ? type.toUpperCase() : "ALBUM";
};

function AlbumDetailPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(initialAlbumDetail);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchAlbumDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPublicAlbumDetail(id);

        if (!ignore) {
          setDetail(response.data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          setDetail(initialAlbumDetail);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchAlbumDetail();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <div className="sf-empty-panel">Memuat detail album...</div>;
  }

  if (error) {
    return (
      <section className="sf-browse-page">
        <div className="sf-alert sf-alert-error" role="alert">
          {error}
        </div>

        <Link to="/" className="sf-button sf-button-secondary sf-fit-button">
          Kembali ke Home
        </Link>
      </section>
    );
  }

  if (!detail.album) {
    return (
      <section className="sf-browse-page">
        <div className="sf-empty-panel">Data album tidak ditemukan.</div>

        <Link to="/" className="sf-button sf-button-secondary sf-fit-button">
          Kembali ke Home
        </Link>
      </section>
    );
  }

  const { album, songs } = detail;

  return (
    <section className="sf-browse-page">
      <div className="sf-content-card sf-detail-hero">
        <div className="sf-detail-cover">
          {album.coverImageUrl ? (
            <img src={album.coverImageUrl} alt="" loading="lazy" />
          ) : (
            <span>{getAlbumInitial(album)}</span>
          )}
        </div>

        <div className="sf-detail-copy">
          <p className="sf-eyebrow">{formatAlbumType(album.type)}</p>
          <h2 className="sf-detail-title">{album.title}</h2>

          <p className="sf-detail-description">
            {album.description || "Deskripsi album belum tersedia."}
          </p>

          <div className="sf-detail-meta-row">
            {album.artist ? (
              <Link to={`/artists/${album.artist.id}`} className="sf-detail-link">
                {album.artist.name}
              </Link>
            ) : (
              <span>Unknown artist</span>
            )}

            {album.releaseYear ? <span>{album.releaseYear}</span> : null}
          </div>

          {album.genres?.length ? (
            <div className="sf-chip-row">
              {album.genres.slice(0, 6).map((genre) => (
                <span key={genre} className="sf-chip">
                  {genre}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <MusicSection
        title="Published Songs"
        subtitle={`Lagu dalam album ${album.title}.`}
        isEmpty={songs.length === 0}
        emptyMessage="Album ini belum memiliki song published."
      >
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </MusicSection>
    </section>
  );
}

export default AlbumDetailPage;