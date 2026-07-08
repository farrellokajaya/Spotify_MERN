import MusicSection from "../components/music/MusicSection";
import SongCard from "../components/music/SongCard";
import useFavorites from "../hooks/useFavorites";

export default function LibraryPage() {
  const { favoriteSongs, loading, error, loadFavorites } = useFavorites();

  return (
    <section className="sf-browse-page">
      <div className="sf-content-card sf-page-panel">
        <p className="sf-eyebrow">Library</p>
        <h2 className="sf-page-title">Favorite Songs</h2>

        <p className="sf-page-subtitle">
          Semua lagu yang kamu simpan sebagai favorite akan muncul di halaman
          ini. Kamu bisa langsung play atau hapus dari library.
        </p>

        <div className="sf-button-row sf-library-actions">
          <button
            type="button"
            className="sf-button sf-button-secondary"
            onClick={loadFavorites}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Library"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="sf-alert sf-alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="sf-empty-panel">Memuat favorite songs...</div>
      ) : null}

      {!loading && !error ? (
        <MusicSection
          title="Liked Songs"
          subtitle={`${favoriteSongs.length} song tersimpan di library kamu.`}
          isEmpty={favoriteSongs.length === 0}
          emptyMessage="Belum ada favorite song. Tambahkan lagu dari Home, Search, Artist Detail, atau Album Detail."
        >
          {favoriteSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </MusicSection>
      ) : null}
    </section>
  );
}