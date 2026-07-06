import { Link } from "react-router";

import useAuth from "../hooks/useAuth";

function HomePage() {
  const { user } = useAuth();

  return (
    <section className="sf-content-card sf-hero">
      <p className="sf-hero-label">Soundify App</p>

      <h2 className="sf-hero-title">
        A clean foundation for your music platform.
      </h2>

      <p className="sf-hero-description">
        Halo, {user?.name || "User"}. Hari ini kita membangun struktur utama:
        layout responsif, navigasi, admin area, serta model data untuk artist,
        album, dan song.
      </p>

      <div className="sf-button-row">
        <Link to="/search" className="sf-button sf-button-primary">
          Explore Search
        </Link>

        <Link to="/library" className="sf-button sf-button-secondary">
          Open Library
        </Link>

        {user?.role === "admin" ? (
          <Link to="/admin" className="sf-button sf-button-secondary">
            Go to Admin
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export default HomePage;