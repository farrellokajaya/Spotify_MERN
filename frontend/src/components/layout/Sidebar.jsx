import { Clock3, Home, Library, ListMusic, Plus, Search, Settings } from "lucide-react";
import { NavLink } from "react-router";

const baseMenu = [
  {
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    label: "Search",
    path: "/search",
    icon: Search,
  },
  {
    label: "Library",
    path: "/library",
    icon: Library,
  },
  {
    label: "Recent",
    path: "/recently-played",
    icon: Clock3,
  },
  {
    label: "Playlists",
    path: "/playlists",
    icon: Plus,
  },
  {
    label: "Queue",
    path: "/queue",
    icon: ListMusic,
  },
];

export default function Sidebar({ user }) {
  const menu = user?.role === "admin"
    ? [
        ...baseMenu,
        {
          label: "Admin",
          path: "/admin",
          icon: Settings,
        },
      ]
    : baseMenu;

  return (
    <aside className="sf-sidebar" aria-label="Main navigation">
      <div className="sf-sidebar-header">
        <span className="sf-logo-mark" aria-hidden="true">
          S
        </span>

        <div className="sf-logo-text">
          <span className="sf-logo-title">Soundify</span>
          <span className="sf-logo-subtitle">Music dashboard</span>
        </div>
      </div>

      <nav className="sf-sidebar-nav">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/" || item.path === "/admin"}
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
      </nav>
    </aside>
  );
}
