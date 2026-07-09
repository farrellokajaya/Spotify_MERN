import { useCallback, useEffect, useState } from "react";

import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import MusicSection from "../components/music/MusicSection";
import SongCard from "../components/music/SongCard";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import { clearRecentlyPlayed, getRecentlyPlayed } from "../services/api";
import { formatPlayedAt } from "../utils/format";

function RecentlyPlayedPage() {
  const { token, isAuthenticated } = useAuth();
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  const loadRecentlyPlayed = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setHistory([]);
      setLoading(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getRecentlyPlayed(token);
      const nextHistory = response.data?.history || [];

      setHistory(nextHistory);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Gagal memuat recently played.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast, token]);

  useEffect(() => {
    let ignore = false;

    Promise.resolve()
      .then(() => {
        if (!ignore) {
          return loadRecentlyPlayed();
        }

        return null;
      })
      .catch(() => null);

    return () => {
      ignore = true;
    };
  }, [loadRecentlyPlayed]);

  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      "Kosongkan semua recently played dari akun kamu?",
    );

    if (!confirmed || !token) {
      return;
    }

    try {
      setClearing(true);
      setError("");

      await clearRecentlyPlayed(token);
      setHistory([]);
      toast.success("Recently played berhasil dibersihkan.");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Gagal membersihkan recently played.");
    } finally {
      setClearing(false);
    }
  };

  const historySongs = history.map((historyItem) => historyItem.song);

  return (
    <section className="sf-browse-page">
      <div className="sf-content-card sf-page-panel">
        <p className="sf-eyebrow">Recently Played</p>
        <h2 className="sf-page-title">Listening History</h2>

        <p className="sf-page-subtitle">
          Lagu yang terakhir kamu putar akan muncul di sini. Song yang sama
          tidak dibuat double, hanya waktu terakhir diputar yang diperbarui.
        </p>

        <div className="sf-button-row sf-library-actions">
          <button
            type="button"
            className="sf-button sf-button-secondary"
            onClick={loadRecentlyPlayed}
            disabled={loading || clearing}
          >
            {loading ? "Refreshing..." : "Refresh History"}
          </button>

          <button
            type="button"
            className="sf-button sf-button-danger"
            onClick={handleClearHistory}
            disabled={loading || clearing || history.length === 0}
          >
            {clearing ? "Clearing..." : "Clear History"}
          </button>
        </div>
      </div>

      <ErrorState message={error} />

      {loading ? <LoadingState message="Memuat recently played..." /> : null}

      {!loading && !error ? (
        <MusicSection
          title="Recently Played"
          subtitle={`${history.length} song terakhir dari akun kamu.`}
          isEmpty={history.length === 0}
          emptyMessage="Belum ada listening history. Putar lagu dari Home, Search, Artist Detail, Album Detail, Library, atau Playlist."
        >
          {history.map((item) => (
            <SongCard
              key={item.id}
              song={item.song}
              songs={historySongs}
              metaText={formatPlayedAt(item.playedAt)}
            />
          ))}
        </MusicSection>
      ) : null}
    </section>
  );
}

export default RecentlyPlayedPage;
