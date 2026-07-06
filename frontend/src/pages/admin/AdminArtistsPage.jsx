function AdminArtistsPage() {
  return (
    <section className="sf-admin-table-card">
      <div className="sf-admin-table-header">
        <p className="sf-eyebrow">Artists</p>

        <h2 className="sf-admin-table-title">
          Artist list
        </h2>

        <p className="sf-admin-table-subtitle">
          Halaman sementara untuk daftar artist. CRUD artist akan dibuat di
          hari berikutnya.
        </p>
      </div>

      <div className="sf-admin-empty">
        Belum ada data artist yang ditampilkan.
      </div>
    </section>
  );
}

export default AdminArtistsPage;