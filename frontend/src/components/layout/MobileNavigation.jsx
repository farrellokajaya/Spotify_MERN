import { NavLink } from "react-router";

const baseMenu = [
  {
    label: "Home",
    path: "/",
    icon: "⌂",
  },
  {
    label: "Search",
    path: "/search",
    icon: "⌕",
  },
  {
    label: "Library",
    path: "/library",
    icon: "▦",
  },
  {
  label: "Recent",
  path: "/recently-played",
  icon: "◴",
  },
  {
    label: "Playlists",
    path: "/playlists",
    icon: "+",
  },
    {
    label: "Queue",
    path: "/queue",
    icon: "≡",
  },
];

export default function MobileNavigation({ user }) {
  const menu = user?.role === "admin"
    ? [
        ...baseMenu,
        {
          label: "Admin",
          path: "/admin",
          icon: "⚙",
        },
      ]
    : baseMenu;

  return (
    <nav className="sf-mobile-nav" aria-label="Mobile navigation">
      {menu.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/" || item.path === "/admin"}
          className={({ isActive }) =>
            isActive ? "sf-mobile-nav-link active" : "sf-mobile-nav-link"
          }
        >
          <span className="sf-mobile-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}