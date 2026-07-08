import { Outlet, useLocation } from "react-router";

import useAuth from "../../hooks/useAuth";
import MobileNavigation from "./MobileNavigation";
import PlayerBar from "../player/PlayerBar";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const pageMeta = {
  "/": {
    eyebrow: "Home",
    title: "Listen without the noise",
    subtitle:
      "Temukan lagu, album, dan artist yang sudah dipublikasikan di Soundify.",
  },
  "/search": {
    eyebrow: "Search",
    title: "Search your sound",
    subtitle: "Cari lagu, artist, dan album dari katalog Soundify.",
  },
  "/library": {
    eyebrow: "Library",
    title: "Your library",
    subtitle:
      "Halaman library sementara. Nanti akan berisi lagu favorit, playlist, dan histori pengguna.",
  },
};

const getPageMeta = (pathname) => {
  if (pathname.startsWith("/artists/")) {
    return {
      eyebrow: "Artist Detail",
      title: "Explore artist",
      subtitle: "Lihat album dan lagu published dari artist pilihan.",
    };
  }

  if (pathname.startsWith("/albums/")) {
    return {
      eyebrow: "Album Detail",
      title: "Explore album",
      subtitle: "Lihat daftar lagu published dari album pilihan.",
    };
  }

  return (
    pageMeta[pathname] || {
      eyebrow: "Soundify",
      title: "Soundify",
      subtitle: "Build your music platform step by step.",
    }
  );
};

function MainLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const meta = getPageMeta(location.pathname);

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
        <PlayerBar />
      </div>
    </div>
  );
}

export default MainLayout;