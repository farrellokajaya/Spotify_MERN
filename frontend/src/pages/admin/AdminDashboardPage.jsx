import { useEffect, useState } from "react";

import useAuth from "../../hooks/useAuth";
import { getAdminDashboard } from "../../services/api";

const initialStats = {
  artists: 0,
  albums: 0,
  songs: 0,
};

function AdminDashboardPage() {
  const { token } = useAuth();

  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminDashboard(token);

      setStats({
        artists: response.data.artists || 0,
        albums: response.data.albums || 0,
        songs: response.data.songs || 0,
      });
    } catch (err) {
      setError(err.message);
      setStats(initialStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const fetchDashboard = async () => {
      try {
        const response = await getAdminDashboard(token);

        if (!ignore) {
          setStats({
            artists: response.data.artists || 0,
            albums: response.data.albums || 0,
            songs: response.data.songs || 0,
          });
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          setStats(initialStats);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <section className="sf-content-card sf-page-panel">
      <div className="sf-admin-table-header-row">
        <div>
          <p className="sf-eyebrow">Overview</p>

          <h2 className="sf-page-title">Admin dashboard</h2>

          <p className="sf-page-subtitle">
            Ringkasan data artist, album, dan song dari database Soundify.
          </p>
        </div>

        <button
          className="sf-admin-secondary-button"
          type="button"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <div className="sf-admin-alert sf-admin-alert-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="sf-grid sf-grid-3" style={{ marginTop: "24px" }}>
        <div className="sf-stat-card">
          <p className="sf-stat-label">Artists</p>
          <p className="sf-stat-value">{loading ? "..." : stats.artists}</p>
        </div>

        <div className="sf-stat-card">
          <p className="sf-stat-label">Albums</p>
          <p className="sf-stat-value">{loading ? "..." : stats.albums}</p>
        </div>

        <div className="sf-stat-card">
          <p className="sf-stat-label">Songs</p>
          <p className="sf-stat-value">{loading ? "..." : stats.songs}</p>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;