import mongoose from "mongoose";

import ListeningHistory from "../models/listeningHistory.model.js";
import Song from "../models/song.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

const formatArtist = (artist) => ({
  id: artist._id,
  name: artist.name,
  slug: artist.slug,
  bio: artist.bio,
  imageUrl: artist.imageUrl,
  genres: artist.genres,
});

const formatAlbum = (album) => ({
  id: album._id,
  title: album.title,
  slug: album.slug,
  coverImageUrl: album.coverImageUrl,
  type: album.type,
});

const formatSong = (song) => ({
  id: song._id,
  title: song.title,
  slug: song.slug,
  artist: song.artist ? formatArtist(song.artist) : null,
  album: song.album ? formatAlbum(song.album) : null,
  durationSeconds: song.durationSeconds,
  trackNumber: song.trackNumber,
  audioUrl: song.audioUrl,
  coverImageUrl:
    song.coverImageUrl ||
    song.album?.coverImageUrl ||
    song.artist?.imageUrl ||
    "",
  genres: song.genres,
  playCount: song.playCount,
});

const formatHistoryItem = (history) => ({
  id: history._id,
  playedAt: history.playedAt,
  song: formatSong(history.song),
});

const populateHistorySongs = (query) => {
  return query.populate({
    path: "song",
    match: { isPublished: true },
    select:
      "title slug artist album durationSeconds trackNumber audioUrl coverImageUrl genres playCount isPublished createdAt",
    populate: [
      {
        path: "artist",
        match: { isActive: true },
        select: "name slug bio imageUrl genres",
      },
      {
        path: "album",
        match: { isPublished: true },
        select: "title slug coverImageUrl type",
      },
    ],
  });
};

const getRecentlyPlayed = async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit) || 20;
    const limit = Math.min(Math.max(requestedLimit, 1), 50);

    const histories = await populateHistorySongs(
      ListeningHistory.find({ user: req.user._id })
        .sort({ playedAt: -1 })
        .limit(limit)
        .select("user song playedAt createdAt updatedAt"),
    );

    const history = histories
      .filter((item) => Boolean(item.song && item.song.artist))
      .map(formatHistoryItem);

    return res.status(200).json({
      success: true,
      message: "Recently played berhasil diambil",
      data: {
        history,
      },
    });
  } catch (error) {
    console.error("Get recently played error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil recently played",
    });
  }
};

const recordSongPlay = async (req, res) => {
  try {
    const { songId } = req.params;

    if (!isValidObjectId(songId)) {
      return res.status(400).json({
        success: false,
        message: "Song ID tidak valid",
      });
    }

    const song = await Song.findOne({
      _id: songId,
      isPublished: true,
    })
      .populate({
        path: "artist",
        match: { isActive: true },
        select: "name slug bio imageUrl genres",
      })
      .populate({
        path: "album",
        match: { isPublished: true },
        select: "title slug coverImageUrl type",
      })
      .select(
        "title slug artist album durationSeconds trackNumber audioUrl coverImageUrl genres playCount isPublished createdAt",
      );

    if (!song || !song.artist) {
      return res.status(404).json({
        success: false,
        message: "Song tidak ditemukan atau belum dipublikasikan",
      });
    }

    const playedAt = new Date();

    const history = await ListeningHistory.findOneAndUpdate(
      {
        user: req.user._id,
        song: song._id,
      },
      {
        $set: {
          playedAt,
        },
        $setOnInsert: {
          user: req.user._id,
          song: song._id,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    await Song.updateOne(
      { _id: song._id },
      {
        $inc: {
          playCount: 1,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Song play berhasil dicatat",
      data: {
        history: {
          id: history._id,
          playedAt: history.playedAt,
          song: formatSong(song),
        },
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Song play sudah tercatat",
      });
    }

    console.error("Record song play error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mencatat song play",
    });
  }
};

const clearRecentlyPlayed = async (req, res) => {
  try {
    const result = await ListeningHistory.deleteMany({ user: req.user._id });

    return res.status(200).json({
      success: true,
      message: "Recently played berhasil dikosongkan",
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    console.error("Clear recently played error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengosongkan recently played",
    });
  }
};

export { clearRecentlyPlayed, getRecentlyPlayed, recordSongPlay };