import {
  ArrowLeft,
  Disc3,
  LayoutDashboard,
  Music,
  UserRound,
} from "lucide-react";

import {
  Link,
  NavLink,
  Outlet,
} from "react-router";

import useAuth from "../../hooks/useAuth";

const adminMenu = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Artists",
    path: "/admin/artists",
    icon: UserRound,
  },
  {
    label: "Albums",
    path: "/admin/albums",
    icon: Disc3,
  },
  {
    label: "Songs",
    path: "/admin/songs",
    icon: Music,
  },
];

function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="sf-admin-layout">
      <div className="sf-admin-shell">
        <aside
          className="sf-admin-sidebar"
          aria-label="Admin navigation"
        >
          <div className="sf-admin-sidebar-header">
            <span className="sf-admin-badge">Admin</span>

            <h1 className="sf-admin-title">
              Soundify Console
            </h1>

            <p className="sf-page-subtitle">
              Manage artists, albums, and songs.
            </p>
          </div>

          <nav className="sf-admin-nav">
            {adminMenu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    isActive ? "sf-nav-link active" : "sf-nav-link"
                  }
                >
                  <span className="sf-nav-icon" aria-hidden="true">
                    <Icon size={19} strokeWidth={2.2} />
                  </span>

                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <Link to="/" className="sf-nav-link">
              <span className="sf-nav-icon" aria-hidden="true">
                <ArrowLeft size={19} strokeWidth={2.2} />
              </span>

              <span>Back to App</span>
            </Link>
          </nav>
        </aside>

        <main className="sf-admin-main">
          <header className="sf-admin-topbar">
            <div>
              <p className="sf-eyebrow">Admin Area</p>

              <h2 className="sf-page-title">
                Content Management
              </h2>
            </div>

            <div className="sf-admin-actions">
              <span className="sf-user-avatar">
                {(user?.name || user?.email || "A")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;