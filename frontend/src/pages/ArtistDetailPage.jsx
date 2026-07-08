import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import AlbumCard from "../components/music/AlbumCard";
import MusicSection from "../components/music/MusicSection";
import SongCard from "../components/music/SongCard";
import { getPublicArtistDetail } from "../services/api";

const initialArtistDetail = {
  artist: null,
  albums: [],
  songs: [],
};

const getArtistInitial = (artist) => {
  return artist?.name?.charAt(0)?.toUpperCase() || "A";
};

function ArtistDetailPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(initialArtistDetail);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchArtistDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPublicArtistDetail(id);

        if (!ignore) {
          setDetail(response.data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          setDetail(initialArtistDetail);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchArtistDetail();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <div className="sf-empty-panel">Memuat detail artist...</div>;
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

  if (!detail.artist) {
    return (
      <section className="sf-browse-page">
        <div className="sf-empty-panel">Data artist tidak ditemukan.</div>

        <Link to="/" className="sf-button sf-button-secondary sf-fit-button">
          Kembali ke Home
        </Link>
      </section>
    );
  }

  const { artist, albums, songs } = detail;

  return (
    <section className="sf-browse-page">
      <div className="sf-content-card sf-detail-hero">
        <div className="sf-detail-cover sf-detail-artist-cover">
          {artist.imageUrl ? (
            <img src={artist.imageUrl} alt="" loading="lazy" />
          ) : (
            <span>{getArtistInitial(artist)}</span>
          )}
        </div>

        <div className="sf-detail-copy">
          <p className="sf-eyebrow">Artist</p>
          <h2 className="sf-detail-title">{artist.name}</h2>

          <p className="sf-detail-description">
            {artist.bio || "Bio artist belum tersedia."}
          </p>

          {artist.genres?.length ? (
            <div className="sf-chip-row">
              {artist.genres.slice(0, 6).map((genre) => (
                <span key={genre} className="sf-chip">
                  {genre}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <MusicSection
        title="Published Albums"
        subtitle={`Album dari ${artist.name} yang sudah dipublikasikan.`}
        isEmpty={albums.length === 0}
        emptyMessage="Artist ini belum memiliki album published."
      >
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </MusicSection>

      <MusicSection
        title="Published Songs"
        subtitle={`Lagu dari ${artist.name} yang sudah dipublikasikan.`}
        isEmpty={songs.length === 0}
        emptyMessage="Artist ini belum memiliki song published."
      >
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </MusicSection>
    </section>
  );
}

export default ArtistDetailPage;