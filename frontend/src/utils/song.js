export const getSongId = (song) => String(song?.id || song?._id || "");

export const getAudioUrl = (song) => song?.audioUrl?.trim() || "";

export const getFallbackDuration = (song) => {
  const durationSeconds = Number(song?.durationSeconds);

  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
    return 0;
  }

  return durationSeconds;
};

export const getSongImage = (song) => {
  return (
    song?.imageUrl ||
    song?.coverImageUrl ||
    song?.album?.coverImageUrl ||
    song?.album?.imageUrl ||
    song?.artist?.imageUrl ||
    ""
  );
};