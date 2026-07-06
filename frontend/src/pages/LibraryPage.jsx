export default function LibraryPage() {
  return (
    <section className="sf-content-card sf-page-panel">
      <p className="sf-eyebrow">Library</p>
      <h2 className="sf-page-title">Library page placeholder</h2>

      <p className="sf-page-subtitle">
        Nanti halaman ini akan menjadi tempat playlist, lagu favorit, dan data
        personal pengguna.
      </p>

      <div className="sf-grid sf-grid-3" style={{ marginTop: "24px" }}>
        <div className="sf-stat-card">
          <p className="sf-stat-label">Liked Songs</p>
          <p className="sf-stat-value">0</p>
        </div>

        <div className="sf-stat-card">
          <p className="sf-stat-label">Playlists</p>
          <p className="sf-stat-value">0</p>
        </div>

        <div className="sf-stat-card">
          <p className="sf-stat-label">Recently Played</p>
          <p className="sf-stat-value">0</p>
        </div>
      </div>
    </section>
  );
}