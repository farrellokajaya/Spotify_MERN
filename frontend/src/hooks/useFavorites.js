import { useContext } from "react";

import FavoriteContext from "../contexts/FavoriteContext";

function useFavorites() {
  const context = useContext(FavoriteContext);

  if (!context) {
    throw new Error(
      "useFavorites harus digunakan di dalam FavoriteProvider",
    );
  }

  return context;
}

export default useFavorites;