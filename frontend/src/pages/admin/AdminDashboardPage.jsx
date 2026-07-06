function AdminDashboardPage() {
  return (
    <section className="sf-content-card sf-page-panel">
      <p className="sf-eyebrow">Overview</p>

      <h2 className="sf-page-title">Admin dashboard</h2>

      <p className="sf-page-subtitle">
        Dashboard sementara. Nanti halaman ini akan mengambil data statistik
        dari endpoint backend /api/admin/dashboard.
      </p>

      <div
        className="sf-grid sf-grid-3"
        style={{ marginTop: "24px" }}
      >
        <div className="sf-stat-card">
          <p className="sf-stat-label">Artists</p>
          <p className="sf-stat-value">0</p>
        </div>

        <div className="sf-stat-card">
          <p className="sf-stat-label">Albums</p>
          <p className="sf-stat-value">0</p>
        </div>

        <div className="sf-stat-card">
          <p className="sf-stat-label">Songs</p>
          <p className="sf-stat-value">0</p>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;