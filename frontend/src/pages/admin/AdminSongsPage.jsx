function AdminSongsPage() {
  return (
    <section className="sf-admin-table-card">
      <div className="sf-admin-table-header">
        <p className="sf-eyebrow">Songs</p>

        <h2 className="sf-admin-table-title">
          Song list
        </h2>

        <p className="sf-admin-table-subtitle">
          Halaman sementara untuk daftar song. Data song sudah punya relasi ke
          artist dan optional album.
        </p>
      </div>

      <div className="sf-admin-empty">
        Belum ada data song yang ditampilkan.
      </div>
    </section>
  );
}

export default AdminSongsPage;