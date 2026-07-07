import { useContext } from "react";

import PlayerContext from "../contexts/PlayerContext";

function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer harus digunakan di dalam PlayerProvider");
  }

  return context;
}

export default usePlayer;