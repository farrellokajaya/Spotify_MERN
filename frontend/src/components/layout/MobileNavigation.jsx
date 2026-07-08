import { NavLink } from "react-router";
import { Clock3, Home, Library, ListMusic, Plus, Search, Settings } from "lucide-react";

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

export default function MobileNavigation({ user }) {
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
    <nav className="sf-mobile-nav" aria-label="Mobile navigation">
      {menu.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/" || item.path === "/admin"}
            className={({ isActive }) =>
              isActive ? "sf-mobile-nav-link active" : "sf-mobile-nav-link"
            }
          >
            <span className="sf-mobile-icon" aria-hidden="true">
              <Icon size={18} strokeWidth={2.2} />
            </span>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}