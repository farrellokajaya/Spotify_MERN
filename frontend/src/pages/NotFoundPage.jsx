import { Link } from "react-router";
import useAuth from "../hooks/useAuth";

function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="center-screen">
      <section className="not-found-card">
        <p className="eyebrow">404</p>

        <h1>Halaman tidak ditemukan</h1>

        <p className="muted-text">
          Alamat yang Anda buka tidak tersedia di
          Soundify.
        </p>

        <Link
          className="primary-button link-button"
          to={isAuthenticated ? "/" : "/login"}
        >
          Kembali
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;