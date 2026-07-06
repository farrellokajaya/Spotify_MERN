export default function SearchPage() {
  return (
    <section className="sf-content-card sf-page-panel">
      <p className="sf-eyebrow">Search</p>
      <h2 className="sf-page-title">Search page placeholder</h2>

      <p className="sf-page-subtitle">
        Fitur pencarian akan dibuat setelah data artist, album, dan song mulai
        tersedia dari backend.
      </p>

      <div className="sf-placeholder-list">
        <div className="sf-placeholder-item">
          <strong>Search songs</strong>
          <span className="sf-muted">Coming soon</span>
        </div>

        <div className="sf-placeholder-item">
          <strong>Search artists</strong>
          <span className="sf-muted">Coming soon</span>
        </div>

        <div className="sf-placeholder-item">
          <strong>Search albums</strong>
          <span className="sf-muted">Coming soon</span>
        </div>
      </div>
    </section>
  );
}