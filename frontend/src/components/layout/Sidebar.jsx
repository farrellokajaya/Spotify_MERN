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
];

export default function Sidebar({ user }) {
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
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/" || item.path === "/admin"}
            className={({ isActive }) =>
              isActive ? "sf-nav-link active" : "sf-nav-link"
            }
          >
            <span className="sf-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}