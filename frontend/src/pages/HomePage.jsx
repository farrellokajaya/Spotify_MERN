import { useEffect, useState } from "react";
import { Link } from "react-router";

import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import AlbumCard from "../components/music/AlbumCard";
import ArtistCard from "../components/music/ArtistCard";
import MusicSection from "../components/music/MusicSection";
import SongCard from "../components/music/SongCard";
import useAuth from "../hooks/useAuth";
import { getMusicHome } from "../services/api";

const initialMusicData = {
  songs: [],
  albums: [],
  artists: [],
};

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [musicData, setMusicData] = useState(initialMusicData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMusicHome = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMusicHome();

      setMusicData(response.data || initialMusicData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const fetchMusic = async () => {
      try {
        const response = await getMusicHome();

        if (!ignore) {
          setMusicData(response.data || initialMusicData);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchMusic();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="sf-browse-page">
      <section className="sf-content-card sf-hero sf-home-hero">
        <p className="sf-hero-label">Soundify App</p>

        <h2 className="sf-hero-title">Music browsing starts here.</h2>

        <p className="sf-hero-description">
          Halo, {user?.name || "Guest"}. Kamu bisa langsung browse, search,
          memutar lagu, dan mencoba queue tanpa login. Login diperlukan untuk
          menyimpan favorite, membuat playlist, dan melihat recently played.
        </p>

        <div className="sf-button-row">
          <Link to="/search" className="sf-button sf-button-primary">
            Search Music
          </Link>

          {isAuthenticated ? null : (
            <Link to="/login" className="sf-button sf-button-secondary">
              Login for Library
            </Link>
          )}

          {user?.role === "admin" ? (
            <Link to="/admin" className="sf-button sf-button-secondary">
              Go to Admin
            </Link>
          ) : null}

          <button
            type="button"
            className="sf-button sf-button-secondary"
            onClick={loadMusicHome}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      <ErrorState message={error} />

      {loading ? <LoadingState message="Memuat data musik..." /> : null}

      {!loading && !error ? (
        <>
          <MusicSection
            title="Latest Songs"
            subtitle="Lagu terbaru yang sudah dipublikasikan."
            isEmpty={musicData.songs.length === 0}
            emptyMessage="Belum ada lagu published."
          >
            {musicData.songs.map((song) => (
              <SongCard key={song.id} song={song} songs={musicData.songs} />
            ))}
          </MusicSection>

          <MusicSection
            title="New Albums"
            subtitle="Album, EP, dan single terbaru dari artist aktif."
            isEmpty={musicData.albums.length === 0}
            emptyMessage="Belum ada album published."
          >
            {musicData.albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </MusicSection>

          <MusicSection
            title="Artists"
            subtitle="Artist aktif yang tersedia di Soundify."
            isEmpty={musicData.artists.length === 0}
            emptyMessage="Belum ada artist aktif."
          >
            {musicData.artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </MusicSection>
        </>
      ) : null}
    </div>
  );
}

export default HomePage;
