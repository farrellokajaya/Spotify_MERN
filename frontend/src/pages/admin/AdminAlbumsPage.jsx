function AdminAlbumsPage() {
  return (
    <section className="sf-admin-table-card">
      <div className="sf-admin-table-header">
        <p className="sf-eyebrow">Albums</p>

        <h2 className="sf-admin-table-title">
          Album list
        </h2>

        <p className="sf-admin-table-subtitle">
          Halaman sementara untuk daftar album. Relasi album ke artist sudah
          disiapkan di backend.
        </p>
      </div>

      <div className="sf-admin-empty">
        Belum ada data album yang ditampilkan.
      </div>
    </section>
  );
}

export default AdminAlbumsPage;