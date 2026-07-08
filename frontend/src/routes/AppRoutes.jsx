import { Route, Routes } from "react-router";

import AdminRoute from "../components/auth/AdminRoute";
import GuestRoute from "../components/auth/GuestRoute";
import ProtectedRoute from "../components/auth/ProtectedRoute";

import AdminLayout from "../components/layout/AdminLayout";
import MainLayout from "../components/layout/MainLayout";

import AlbumDetailPage from "../pages/AlbumDetailPage";
import ArtistDetailPage from "../pages/ArtistDetailPage";
import HomePage from "../pages/HomePage";
import LibraryPage from "../pages/LibraryPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import RegisterPage from "../pages/RegisterPage";
import SearchPage from "../pages/SearchPage";

import AdminAlbumsPage from "../pages/admin/AdminAlbumsPage";
import AdminArtistsPage from "../pages/admin/AdminArtistsPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminSongsPage from "../pages/admin/AdminSongsPage";

import PlaylistDetailPage from "../pages/PlaylistDetailPage";
import PlaylistPage from "../pages/PlaylistPage";
import RecentlyPlayedPage from "../pages/RecentlyPlayedPage";
import QueuePage from "../pages/QueuePage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/artists/:id" element={<ArtistDetailPage />} />
          <Route path="/albums/:id" element={<AlbumDetailPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/playlists" element={<PlaylistPage />} />
          <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
          <Route path="/recently-played" element={<RecentlyPlayedPage />} />
          <Route path="/queue" element={<QueuePage />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="artists" element={<AdminArtistsPage />} />
          <Route path="albums" element={<AdminAlbumsPage />} />
          <Route path="songs" element={<AdminSongsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;