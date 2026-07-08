import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import PlayerContext from "./PlayerContext";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import { recordSongPlay } from "../services/api";
import {
  buildUniqueSongs,
  getRandomIndex,
  getSafeTime,
} from "../utils/player";
import {
  getAudioUrl,
  getFallbackDuration,
  getSongId,
} from "../utils/song";

function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const lastRecordedSongIdRef = useRef("");
  const { token, isAuthenticated } = useAuth();
  const toast = useToast();

  const [currentSong, setCurrentSong] = useState(null);
  const [queueSongs, setQueueSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");

  const pauseAudioElement = useCallback(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
    }
  }, []);

  const resetAudioElement = useCallback(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      delete audio.dataset.songId;
      audio.load();
    }
  }, []);

  const recordPlaySafely = useCallback(
    (song) => {
      const songId = getSongId(song);

      if (!isAuthenticated || !token || !songId) {
        return;
      }

      if (lastRecordedSongIdRef.current === songId) {
        return;
      }

      lastRecordedSongIdRef.current = songId;

      recordSongPlay(token, songId).catch(() => {
        if (lastRecordedSongIdRef.current === songId) {
          lastRecordedSongIdRef.current = "";
        }
      });
    },
    [isAuthenticated, token],
  );

  const startSong = useCallback(
    (song, index) => {
      const audioUrl = getAudioUrl(song);

      setCurrentSong(song);
      setCurrentIndex(index);
      setCurrentTime(0);
      setDuration(getFallbackDuration(song));
      setError("");
      setIsLoading(Boolean(audioUrl));

      if (!audioUrl) {
        setIsPlaying(false);
        setIsLoading(false);
        setError("Audio lagu belum tersedia atau audioUrl masih kosong.");
        toast.error("Audio lagu belum tersedia atau audioUrl masih kosong.");
        return;
      }

      recordPlaySafely(song);
      setIsPlaying(true);
    },
    [recordPlaySafely, toast],
  );

  const playSong = useCallback(
    (song) => {
      if (!song) {
        return;
      }

      setQueueSongs([song]);
      startSong(song, 0);
    },
    [startSong],
  );

  const playSongList = useCallback(
    (songs = [], startSongItem) => {
      const uniqueSongs = buildUniqueSongs(songs);
      const targetSong = startSongItem || uniqueSongs[0];
      const targetSongId = getSongId(targetSong);

      if (!targetSongId) {
        return;
      }

      let targetIndex = uniqueSongs.findIndex((song) => {
        return getSongId(song) === targetSongId;
      });

      let nextQueue = uniqueSongs;

      if (targetIndex < 0) {
        nextQueue = buildUniqueSongs([targetSong, ...uniqueSongs]);
        targetIndex = 0;
      }

      setQueueSongs(nextQueue);
      startSong(nextQueue[targetIndex], targetIndex);
    },
    [startSong],
  );

  const pauseSong = useCallback(() => {
    pauseAudioElement();
    setIsPlaying(false);
  }, [pauseAudioElement]);

  const togglePlay = useCallback(() => {
    if (!currentSong) {
      return;
    }

    if (!getAudioUrl(currentSong)) {
      setIsPlaying(false);
      setIsLoading(false);
      setError("Audio lagu belum tersedia atau audioUrl masih kosong.");
      toast.error("Audio lagu belum tersedia atau audioUrl masih kosong.");
      return;
    }

    setError("");
    setIsPlaying((currentValue) => !currentValue);
  }, [currentSong, toast]);

  const playNext = useCallback(() => {
    if (!queueSongs.length) {
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    if (currentIndex < 0) {
      startSong(queueSongs[0], 0);
      return;
    }

    if (isShuffle) {
      const nextIndex = getRandomIndex(queueSongs.length, currentIndex);
      startSong(queueSongs[nextIndex], nextIndex);
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex < queueSongs.length) {
      startSong(queueSongs[nextIndex], nextIndex);
      return;
    }

    if (isRepeat) {
      startSong(queueSongs[0], 0);
      return;
    }

    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
  }, [currentIndex, isRepeat, isShuffle, queueSongs, startSong]);

  const playPrevious = useCallback(() => {
    if (!queueSongs.length || currentIndex < 0) {
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    if (isShuffle) {
      const previousIndex = getRandomIndex(queueSongs.length, currentIndex);
      startSong(queueSongs[previousIndex], previousIndex);
      return;
    }

    const previousIndex = currentIndex - 1;

    if (previousIndex >= 0) {
      startSong(queueSongs[previousIndex], previousIndex);
      return;
    }

    if (isRepeat) {
      const lastIndex = queueSongs.length - 1;
      startSong(queueSongs[lastIndex], lastIndex);
      return;
    }

    startSong(queueSongs[0], 0);
  }, [currentIndex, isRepeat, isShuffle, queueSongs, startSong]);

  const addToQueue = useCallback(
    (song) => {
      const songId = getSongId(song);

      if (!songId) {
        toast.error("Song tidak valid dan gagal dimasukkan ke queue.");
        return false;
      }

      const alreadyExists = queueSongs.some((queueSong) => {
        return getSongId(queueSong) === songId;
      });

      if (alreadyExists) {
        toast.info(`${song.title} sudah ada di queue.`);
        return false;
      }

      setQueueSongs((currentQueue) => {
        const existsInCurrentQueue = currentQueue.some((queueSong) => {
          return getSongId(queueSong) === songId;
        });

        if (existsInCurrentQueue) {
          return currentQueue;
        }

        return [...currentQueue, song];
      });

      toast.success(`${song.title} berhasil dimasukkan ke queue.`);
      return true;
    },
    [queueSongs, toast],
  );

  const removeFromQueue = useCallback(
    (songId) => {
      const targetSongId = String(songId || "");

      if (!targetSongId) {
        return;
      }

      const removedIndex = queueSongs.findIndex((song) => {
        return getSongId(song) === targetSongId;
      });

      if (removedIndex < 0) {
        return;
      }

      const removedSong = queueSongs[removedIndex];

      const nextQueue = queueSongs.filter((song) => {
        return getSongId(song) !== targetSongId;
      });

      setQueueSongs(nextQueue);
      toast.success(`${removedSong?.title || "Song"} dihapus dari queue.`);

      if (getSongId(currentSong) === targetSongId) {
        const nextSong = nextQueue[removedIndex] || nextQueue[removedIndex - 1];

        if (nextSong) {
          const nextIndex = nextQueue.findIndex((song) => {
            return getSongId(song) === getSongId(nextSong);
          });

          startSong(nextSong, nextIndex);
          return;
        }

        resetAudioElement();
        setCurrentSong(null);
        setCurrentIndex(-1);
        setIsPlaying(false);
        setIsLoading(false);
        setCurrentTime(0);
        setDuration(0);
        setError("");
        return;
      }

      if (removedIndex < currentIndex) {
        setCurrentIndex((index) => Math.max(index - 1, 0));
      }
    },
    [
      currentIndex,
      currentSong,
      queueSongs,
      resetAudioElement,
      startSong,
      toast,
    ],
  );

  const clearQueue = useCallback(() => {
    const hasOnlyCurrentSong = currentSong && queueSongs.length <= 1;

    setQueueSongs(currentSong ? [currentSong] : []);
    setCurrentIndex(currentSong ? 0 : -1);

    if (hasOnlyCurrentSong) {
      toast.info("Up next sudah kosong.");
      return;
    }

    toast.success("Queue berhasil dibersihkan.");
  }, [currentSong, queueSongs.length, toast]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((currentValue) => !currentValue);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat((currentValue) => !currentValue);
  }, []);

  const clearPlayer = useCallback(() => {
    resetAudioElement();
    setCurrentSong(null);
    setQueueSongs([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
    setError("");
  }, [resetAudioElement]);

  const seekTo = useCallback((time) => {
    const nextTime = Number(time);

    if (!Number.isFinite(nextTime) || nextTime < 0) {
      return;
    }

    const audio = audioRef.current;

    if (audio) {
      audio.currentTime = nextTime;
    }

    setCurrentTime(nextTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const metadataDuration = getSafeTime(audio.duration);

    setDuration(metadataDuration || getFallbackDuration(currentSong));
    setIsLoading(false);
    setError("");
  }, [currentSong]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setCurrentTime(getSafeTime(audio.currentTime));
  }, []);

  const handleEnded = useCallback(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.currentTime = 0;
    }

    setCurrentTime(0);
    setIsLoading(false);
    playNext();
  }, [playNext]);

  const handleError = useCallback(() => {
    if (!currentSong) {
      return;
    }

    const errorMessage =
      "Audio gagal diputar. Periksa audioUrl, akses file, format audio, atau CORS dari domain audio.";

    setIsPlaying(false);
    setIsLoading(false);
    setError(errorMessage);
    toast.error(errorMessage);
  }, [currentSong, toast]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    pauseAudioElement();

    if (!currentSong) {
      resetAudioElement();
      return;
    }

    const audioUrl = getAudioUrl(currentSong);

    if (!audioUrl) {
      resetAudioElement();
      return;
    }

    audio.dataset.songId = getSongId(currentSong);
    audio.src = audioUrl;
    audio.load();
  }, [currentSong, pauseAudioElement, resetAudioElement]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentSong) {
      return;
    }

    if (!isPlaying) {
      audio.pause();
      return;
    }

    if (!getAudioUrl(currentSong)) {
      return;
    }

    const songId = getSongId(currentSong);
    const playPromise = audio.play();

    if (playPromise) {
      playPromise.catch(() => {
        if (audio.dataset.songId !== songId) {
          return;
        }

        setIsPlaying(false);
        setIsLoading(false);
        setError(
          "Audio gagal diputar. Browser mungkin memblokir autoplay, audioUrl tidak valid, atau file audio tidak bisa diakses.",
        );
      });
    }
  }, [currentSong, isPlaying]);

  const previousSong = useMemo(() => {
    return currentIndex > 0 ? queueSongs[currentIndex - 1] : null;
  }, [currentIndex, queueSongs]);

  const nextSong = useMemo(() => {
    return currentIndex >= 0 ? queueSongs[currentIndex + 1] || null : null;
  }, [currentIndex, queueSongs]);

  const upNextSongs = useMemo(() => {
    return currentIndex >= 0 ? queueSongs.slice(currentIndex + 1) : [];
  }, [currentIndex, queueSongs]);

  const value = useMemo(
    () => ({
      currentSong,
      queueSongs,
      currentIndex,
      previousSong,
      nextSong,
      upNextSongs,
      isShuffle,
      isRepeat,
      isPlaying,
      isLoading,
      currentTime,
      duration,
      error,
      playSong,
      playSongList,
      pauseSong,
      togglePlay,
      playNext,
      playPrevious,
      addToQueue,
      removeFromQueue,
      clearQueue,
      toggleShuffle,
      toggleRepeat,
      seekTo,
      clearPlayer,
    }),
    [
      addToQueue,
      clearPlayer,
      clearQueue,
      currentIndex,
      currentSong,
      currentTime,
      duration,
      error,
      isLoading,
      isPlaying,
      isRepeat,
      isShuffle,
      nextSong,
      pauseSong,
      playNext,
      playPrevious,
      playSong,
      playSongList,
      previousSong,
      queueSongs,
      removeFromQueue,
      seekTo,
      togglePlay,
      toggleRepeat,
      toggleShuffle,
      upNextSongs,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}

      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
      />
    </PlayerContext.Provider>
  );
}

export default PlayerProvider;