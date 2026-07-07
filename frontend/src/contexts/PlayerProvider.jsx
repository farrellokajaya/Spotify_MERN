import { useCallback, useMemo, useState } from "react";

import PlayerContext from "./PlayerContext";

function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = useCallback((song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((current) => !current);
  }, []);

  const clearPlayer = useCallback(() => {
    setCurrentSong(null);
    setIsPlaying(false);
  }, []);

  const value = useMemo(
    () => ({
      currentSong,
      isPlaying,
      playSong,
      togglePlay,
      clearPlayer,
    }),
    [clearPlayer, currentSong, isPlaying, playSong, togglePlay],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export default PlayerProvider;