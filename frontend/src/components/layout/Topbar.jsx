import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import useAuth from "../../hooks/useAuth";

function getInitials(name, email) {
  const source = name || email || "User";

  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function Topbar({
  eyebrow = "Soundify",
  title = "Welcome back",
  subtitle = "Kelola musik, library, dan konten Soundify dari satu tempat.",
  user,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const initials = useMemo(
    () => getInitials(user?.name, user?.email),
    [user?.name, user?.email],
  );

  function handleLogout() {
    logout();
    setIsOpen(false);
    navigate("/", { replace: true });
  }

  return (
    <header className="sf-topbar">
      <div className="sf-topbar-copy">
        <p className="sf-eyebrow">{eyebrow}</p>
        <h1 className="sf-page-title">{title}</h1>

        {subtitle ? (
          <p className="sf-page-subtitle">{subtitle}</p>
        ) : null}
      </div>

      <div className="sf-user-menu">
        {!user ? (
          <div className="sf-topbar-auth-actions" aria-label="Guest actions">
            <span className="sf-guest-pill">Guest mode</span>
            <Link to="/login" className="sf-button sf-button-secondary">
              Login
            </Link>
            <Link to="/register" className="sf-button sf-button-primary">
              Register
            </Link>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="sf-user-button"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((current) => !current)}
            >
              <span className="sf-user-avatar">{initials}</span>

              <span className="sf-user-meta">
                <span className="sf-user-name">
                  {user.name || "User"}
                </span>

                <span className="sf-user-role">
                  {user.role || "user"}
                </span>
              </span>
            </button>

            {isOpen ? (
              <div className="sf-user-dropdown" role="menu">
                <div className="sf-user-dropdown-header">
                  <p className="sf-user-dropdown-name">
                    {user.name || "User"}
                  </p>

                  <p className="sf-user-dropdown-email">
                    {user.email || "No email"}
                  </p>
                </div>

                <button
                  type="button"
                  className="sf-dropdown-action"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </header>
  );
}

export default Topbar;
