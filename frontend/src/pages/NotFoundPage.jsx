import { Link } from "react-router";

const NotFoundPage = () => {
  return (
    <main className="not-found-page">
      <p className="eyebrow">
        ERROR 404
      </p>

      <h1>Halaman tidak ditemukan</h1>

      <p>
        Halaman yang kamu cari tidak tersedia
        di Soundify.
      </p>

      <Link
        to="/"
        className="primary-link"
      >
        Kembali ke Home
      </Link>
    </main>
  );
};

export default NotFoundPage;