import { useCallback, useEffect, useMemo, useState } from "react";

import FavoriteContext from "./FavoriteContext";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import {
  addFavoriteSong,
  getFavoriteSongs,
  removeFavoriteSong,
} from "../services/api";

const getSafeSongId = (songId) => String(songId || "");

const buildFavoriteIds = (songs) => {
  return new Set(songs.map((song) => getSafeSongId(song.id)));
};

function FavoriteProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const toast = useToast();
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startPending = useCallback((songId) => {
    setPendingIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(songId);
      return nextIds;
    });
  }, []);

  const stopPending = useCallback((songId) => {
    setPendingIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.delete(songId);
      return nextIds;
    });
  }, []);

  const loadFavorites = useCallback(async () => {
    await Promise.resolve();

    if (!isAuthenticated || !token) {
      setFavoriteSongs([]);
      setFavoriteIds(new Set());
      setLoading(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getFavoriteSongs(token);
      const songs = response.data?.songs || [];

      setFavoriteSongs(songs);
      setFavoriteIds(buildFavoriteIds(songs));
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Gagal memuat Favorite.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast, token]);

  useEffect(() => {
    let ignore = false;

    if (!isAuthenticated || !token) {
      Promise.resolve().then(() => {
        if (!ignore) {
          setFavoriteSongs([]);
          setFavoriteIds(new Set());
          setLoading(false);
          setError("");
        }
      });

      return () => {
        ignore = true;
      };
    }

    Promise.resolve()
      .then(() => {
        if (!ignore) {
          setLoading(true);
          setError("");
        }

        return getFavoriteSongs(token);
      })
      .then((response) => {
        if (!ignore) {
          const songs = response.data?.songs || [];

          setFavoriteSongs(songs);
          setFavoriteIds(buildFavoriteIds(songs));
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
          toast.error(err.message || "Gagal memuat Favorite.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, toast, token]);

  const isSongFavorite = useCallback(
    (songId) => {
      return favoriteIds.has(getSafeSongId(songId));
    },
    [favoriteIds],
  );

  const isFavoritePending = useCallback(
    (songId) => {
      return pendingIds.has(getSafeSongId(songId));
    },
    [pendingIds],
  );

  const addFavorite = useCallback(
    async (song) => {
      const songId = getSafeSongId(song?.id);

      if (!songId || !token) {
        toast.error("Song tidak valid dan gagal ditambahkan ke Favorite.");
        return null;
      }

      if (favoriteIds.has(songId) || pendingIds.has(songId)) {
        return null;
      }

      startPending(songId);
      setError("");

      setFavoriteIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(songId);
        return nextIds;
      });

      try {
        const response = await addFavoriteSong(token, songId);
        const nextSong = response.data?.song || song;

        setFavoriteSongs((currentSongs) => {
          const alreadyExists = currentSongs.some(
            (currentSong) => getSafeSongId(currentSong.id) === songId,
          );

          if (alreadyExists) {
            return currentSongs;
          }

          return [nextSong, ...currentSongs];
        });

        toast.success(`${nextSong.title || "Song"} ditambahkan ke Favorite.`);
        return nextSong;
      } catch (err) {
        setFavoriteIds((currentIds) => {
          const nextIds = new Set(currentIds);
          nextIds.delete(songId);
          return nextIds;
        });

        setError(err.message);
        toast.error(err.message || "Gagal menambahkan song ke Favorite.");
        throw err;
      } finally {
        stopPending(songId);
      }
    },
    [favoriteIds, pendingIds, startPending, stopPending, toast, token],
  );

  const removeFavorite = useCallback(
    async (songId) => {
      const safeSongId = getSafeSongId(songId);

      if (!safeSongId || !token || pendingIds.has(safeSongId)) {
        return false;
      }

      const previousSongs = favoriteSongs;
      const previousIds = favoriteIds;

      startPending(safeSongId);
      setError("");

      setFavoriteIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(safeSongId);
        return nextIds;
      });

      setFavoriteSongs((currentSongs) => {
        return currentSongs.filter(
          (song) => getSafeSongId(song.id) !== safeSongId,
        );
      });

      try {
        await removeFavoriteSong(token, safeSongId);
        toast.success("Song dihapus dari Favorite.");
        return true;
      } catch (err) {
        setFavoriteSongs(previousSongs);
        setFavoriteIds(previousIds);
        setError(err.message);
        toast.error(err.message || "Gagal menghapus song dari Favorite.");
        throw err;
      } finally {
        stopPending(safeSongId);
      }
    },
    [favoriteIds, favoriteSongs, pendingIds, startPending, stopPending, toast, token],
  );

  const toggleFavorite = useCallback(
    async (song) => {
      const songId = getSafeSongId(song?.id);

      if (!songId) {
        toast.error("Song tidak valid dan gagal memperbarui Favorite.");
        return null;
      }

      if (favoriteIds.has(songId)) {
        return removeFavorite(songId);
      }

      return addFavorite(song);
    },
    [addFavorite, favoriteIds, removeFavorite, toast],
  );

  const value = useMemo(
    () => ({
      favoriteSongs,
      favoriteIds,
      pendingIds,
      loading,
      error,
      loadFavorites,
      isSongFavorite,
      isFavoritePending,
      addFavorite,
      removeFavorite,
      toggleFavorite,
    }),
    [
      addFavorite,
      error,
      favoriteIds,
      favoriteSongs,
      isFavoritePending,
      isSongFavorite,
      loadFavorites,
      loading,
      pendingIds,
      removeFavorite,
      toggleFavorite,
    ],
  );

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
}

export default FavoriteProvider;
