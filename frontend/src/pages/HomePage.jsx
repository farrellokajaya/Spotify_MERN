import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-logo-icon">
            S
          </span>

          <span>Soundify</span>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className="sidebar-link active"
          >
            Home
          </button>

          <button
            type="button"
            className="sidebar-link"
          >
            Search
          </button>

          <button
            type="button"
            className="sidebar-link"
          >
            Your Library
          </button>
        </nav>

        <div className="sidebar-footer">
          <p>Login sebagai</p>
          <strong>{user?.email}</strong>
        </div>
      </aside>

      <main className="home-content">
        <header className="home-header">
          <div>
            <p className="eyebrow">
              SOUNDIFY DASHBOARD
            </p>

            <h1>
              Selamat datang, {user?.name}
            </h1>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={logout}
          >
            Logout
          </button>
        </header>

        <section className="welcome-card">
          <div>
            <p className="eyebrow">
              AUTHENTICATION SUCCESS
            </p>

            <h2>
              Akunmu sudah terhubung dengan
              Soundify.
            </h2>

            <p>
              Login, JWT, protected route,
              pemulihan session, dan logout
              berhasil dijalankan.
            </p>
          </div>

          <div className="profile-summary">
            <div className="profile-avatar">
              {user?.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card">
            <span>Role</span>
            <strong>{user?.role}</strong>
          </article>

          <article className="dashboard-card">
            <span>Status akun</span>
            <strong>
              {user?.isActive
                ? "Aktif"
                : "Tidak aktif"}
            </strong>
          </article>

          <article className="dashboard-card">
            <span>Session</span>
            <strong>JWT aktif</strong>
          </article>
        </section>
      </main>
    </div>
  );
};

export default HomePage;