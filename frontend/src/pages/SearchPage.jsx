import { useState } from "react";

import AlbumCard from "../components/music/AlbumCard";
import ArtistCard from "../components/music/ArtistCard";
import MusicSection from "../components/music/MusicSection";
import SongCard from "../components/music/SongCard";
import { searchMusic } from "../services/api";

const initialResults = {
  query: "",
  songs: [],
  albums: [],
  artists: [],
};

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const response = await searchMusic(query.trim());

      setResults(response.data);
    } catch (err) {
      setError(err.message);
      setResults(initialResults);
    } finally {
      setLoading(false);
    }
  };

  const hasResults =
    results.songs.length > 0 ||
    results.albums.length > 0 ||
    results.artists.length > 0;

  return (
    <section className="sf-browse-page">
      <div className="sf-content-card sf-search-panel">
        <p className="sf-eyebrow">Search</p>
        <h2 className="sf-page-title">Find your music</h2>

        <p className="sf-page-subtitle">
          Cari lagu, artist, atau album yang sudah tersedia di katalog
          Soundify.
        </p>

        <form className="sf-search-form" onSubmit={handleSubmit}>
          <label htmlFor="music-search" className="sf-sr-only">
            Search music
          </label>

          <input
            id="music-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari lagu, artist, album..."
            minLength="2"
          />

          <button
            type="submit"
            className="sf-button sf-button-primary"
            disabled={loading || query.trim().length < 2}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {error ? (
        <div className="sf-alert sf-alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? <div className="sf-empty-panel">Mencari musik...</div> : null}

      {!loading && hasSearched && !error && !hasResults ? (
        <div className="sf-empty-panel">
          Tidak ada hasil untuk &quot;{results.query || query}&quot;.
        </div>
      ) : null}

      {!loading && hasResults ? (
        <>
          <MusicSection
            title="Songs"
            subtitle="Hasil pencarian lagu."
            isEmpty={results.songs.length === 0}
            emptyMessage="Tidak ada lagu."
          >
            {results.songs.map((song) => (
              <SongCard key={song.id} song={song} songs={results.songs} />
            ))}
          </MusicSection>

          <MusicSection
            title="Albums"
            subtitle="Hasil pencarian album."
            isEmpty={results.albums.length === 0}
            emptyMessage="Tidak ada album."
          >
            {results.albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </MusicSection>

          <MusicSection
            title="Artists"
            subtitle="Hasil pencarian artist."
            isEmpty={results.artists.length === 0}
            emptyMessage="Tidak ada artist."
          >
            {results.artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </MusicSection>
        </>
      ) : null}
    </section>
  );
}

export default SearchPage;