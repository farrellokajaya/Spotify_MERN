import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import PlayerContext from "./PlayerContext";

const getAudioUrl = (song) => song?.audioUrl?.trim() || "";

const getSongId = (song) => String(song?.id || "");

const getFallbackDuration = (song) => {
  const durationSeconds = Number(song?.durationSeconds);

  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
    return 0;
  }

  return durationSeconds;
};

const getSafeTime = (time) => {
  if (!Number.isFinite(time) || time < 0) {
    return 0;
  }

  return time;
};

function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
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

  const playSong = useCallback((song) => {
    const audioUrl = getAudioUrl(song);

    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(getFallbackDuration(song));
    setError("");
    setIsLoading(Boolean(audioUrl));

    if (!audioUrl) {
      setIsPlaying(false);
      setIsLoading(false);
      setError("Audio lagu belum tersedia atau audioUrl masih kosong.");
      return;
    }

    setIsPlaying(true);
  }, []);

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
      return;
    }

    setError("");
    setIsPlaying((currentValue) => !currentValue);
  }, [currentSong]);

  const clearPlayer = useCallback(() => {
    resetAudioElement();
    setCurrentSong(null);
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

    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
  }, []);

  const handleError = useCallback(() => {
    if (!currentSong) {
      return;
    }

    setIsPlaying(false);
    setIsLoading(false);
    setError(
      "Audio gagal diputar. Periksa audioUrl, akses file, format audio, atau CORS dari domain audio.",
    );
  }, [currentSong]);

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

  const value = useMemo(
    () => ({
      currentSong,
      isPlaying,
      isLoading,
      currentTime,
      duration,
      error,
      playSong,
      pauseSong,
      togglePlay,
      seekTo,
      clearPlayer,
    }),
    [
      clearPlayer,
      currentSong,
      currentTime,
      duration,
      error,
      isLoading,
      isPlaying,
      pauseSong,
      playSong,
      seekTo,
      togglePlay,
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