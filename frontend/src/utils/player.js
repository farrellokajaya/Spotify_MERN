import { getSongId } from "./song";

export const getSafeTime = (time) => {
  if (!Number.isFinite(time) || time < 0) {
    return 0;
  }

  return time;
};

export const buildUniqueSongs = (songs = []) => {
  const songMap = new Map();

  songs.forEach((song) => {
    const songId = getSongId(song);

    if (songId && !songMap.has(songId)) {
      songMap.set(songId, song);
    }
  });

  return Array.from(songMap.values());
};

export const getRandomIndex = (totalSongs, currentIndex) => {
  if (totalSongs <= 1) {
    return currentIndex;
  }

  let nextIndex = currentIndex;

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * totalSongs);
  }

  return nextIndex;
};

export const shuffleSongs = (songs = []) => {
  const shuffledSongs = [...songs];

  for (let index = shuffledSongs.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const currentSong = shuffledSongs[index];

    shuffledSongs[index] = shuffledSongs[randomIndex];
    shuffledSongs[randomIndex] = currentSong;
  }

  return shuffledSongs;
};