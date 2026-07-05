import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { getHealthStatus } from "../services/api";

function HomePage() {
  const { user, logout } = useAuth();

  const [apiStatus, setApiStatus] = useState(
    "Memeriksa API...",
  );

  const [apiConnected, setApiConnected] =
    useState(false);

  useEffect(() => {
    let ignore = false;

    getHealthStatus()
      .then((response) => {
        if (!ignore) {
          setApiStatus(response.message);
          setApiConnected(true);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setApiStatus(error.message);
          setApiConnected(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="home-page">
      <header className="temporary-header">
        <span className="brand">Soundify</span>

        <button
          className="secondary-button"
          onClick={logout}
          type="button"
        >
          Keluar
        </button>
      </header>

      <section className="home-hero">
        <div>
          <p className="eyebrow">
            Fondasi frontend selesai
          </p>

          <h1>Halo, {user?.name}</h1>

          <p className="hero-copy">
            Homepage sementara ini memastikan routing,
            autentikasi, token, dan koneksi API telah
            bekerja sebelum layout utama dibangun.
          </p>
        </div>

        <div className="status-panel">
          <p className="status-label">
            Status backend
          </p>

          <p
            className={
              apiConnected
                ? "status-online"
                : "status-offline"
            }
          >
            {apiConnected
              ? "Terhubung"
              : "Tidak terhubung"}
          </p>

          <p className="muted-text">{apiStatus}</p>
        </div>
      </section>

      <section className="foundation-grid">
        <article>
          <span>01</span>
          <h2>Routing</h2>

          <p>
            Route home, login, register, dan not-found
            sudah tersedia.
          </p>
        </article>

        <article>
          <span>02</span>
          <h2>Authentication</h2>

          <p>
            JWT disimpan dan sesi pengguna dipulihkan
            melalui endpoint me.
          </p>
        </article>

        <article>
          <span>03</span>
          <h2>Next</h2>

          <p>
            Sidebar, navbar, model musik, dan fondasi
            admin pada Hari Kelima.
          </p>
        </article>
      </section>
    </main>
  );
}

export default HomePage;