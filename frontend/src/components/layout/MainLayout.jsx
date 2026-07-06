import { Outlet, useLocation } from "react-router";

import useAuth from "../../hooks/useAuth";
import MobileNavigation from "./MobileNavigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const pageMeta = {
  "/": {
    eyebrow: "Home",
    title: "Listen without the noise",
    subtitle:
      "Fondasi Soundify sudah siap. Berikutnya kita akan mulai mengisi data artist, album, dan song.",
  },
  "/search": {
    eyebrow: "Search",
    title: "Search your sound",
    subtitle:
      "Halaman pencarian sementara. Nanti akan dipakai untuk mencari lagu, artist, dan album.",
  },
  "/library": {
    eyebrow: "Library",
    title: "Your library",
    subtitle:
      "Halaman library sementara. Nanti akan berisi lagu favorit, playlist, dan histori pengguna.",
  },
};

function MainLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const meta = pageMeta[location.pathname] || {
    eyebrow: "Soundify",
    title: "Soundify",
    subtitle: "Build your music platform step by step.",
  };

  return (
    <div className="sf-app-shell">
      <div className="sf-app-layout">
        <Sidebar user={user} />

        <main className="sf-main-area">
          <Topbar
            eyebrow={meta.eyebrow}
            title={meta.title}
            subtitle={meta.subtitle}
            user={user}
          />

          <Outlet />
        </main>

        <MobileNavigation user={user} />
      </div>
    </div>
  );
}

export default MainLayout;