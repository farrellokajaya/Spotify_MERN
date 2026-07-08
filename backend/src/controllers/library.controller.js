import mongoose from "mongoose";

import FavoriteSong from "../models/favoriteSong.model.js";
import Song from "../models/song.model.js";

const formatArtist = (artist) => ({
  id: artist._id,
  name: artist.name,
  slug: artist.slug,
  bio: artist.bio,
  imageUrl: artist.imageUrl,
  genres: artist.genres,
});

const formatSong = (song) => ({
  id: song._id,
  title: song.title,
  slug: song.slug,
  artist: song.artist ? formatArtist(song.artist) : null,
  album: song.album
    ? {
        id: song.album._id,
        title: song.album.title,
        slug: song.album.slug,
        coverImageUrl: song.album.coverImageUrl,
        type: song.album.type,
      }
    : null,
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
  isFavorite: true,
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

const getFavoriteSongs = async (req, res) => {
  try {
    const favorites = await FavoriteSong.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
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

    const songs = favorites
      .map((favorite) => favorite.song)
      .filter((song) => Boolean(song && song.artist))
      .map(formatSong);

    return res.status(200).json({
      success: true,
      message: "Favorite songs berhasil diambil",
      data: {
        songs,
      },
    });
  } catch (error) {
    console.error("Get favorite songs error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil favorite songs",
    });
  }
};

const addFavoriteSong = async (req, res) => {
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

    const favorite = await FavoriteSong.findOneAndUpdate(
      {
        user: req.user._id,
        song: song._id,
      },
      {
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

    return res.status(200).json({
      success: true,
      message: "Song berhasil ditambahkan ke favorite",
      data: {
        favoriteId: favorite._id,
        song: formatSong(song),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Song sudah ada di favorite",
      });
    }

    console.error("Add favorite song error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan song ke favorite",
    });
  }
};

const removeFavoriteSong = async (req, res) => {
  try {
    const { songId } = req.params;

    if (!isValidObjectId(songId)) {
      return res.status(400).json({
        success: false,
        message: "Song ID tidak valid",
      });
    }

    await FavoriteSong.findOneAndDelete({
      user: req.user._id,
      song: songId,
    });

    return res.status(200).json({
      success: true,
      message: "Song berhasil dihapus dari favorite",
      data: {
        songId,
      },
    });
  } catch (error) {
    console.error("Remove favorite song error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus song dari favorite",
    });
  }
};

const checkFavoriteSong = async (req, res) => {
  try {
    const { songId } = req.params;

    if (!isValidObjectId(songId)) {
      return res.status(400).json({
        success: false,
        message: "Song ID tidak valid",
      });
    }

    const favorite = await FavoriteSong.exists({
      user: req.user._id,
      song: songId,
    });

    return res.status(200).json({
      success: true,
      message: "Status favorite berhasil dicek",
      data: {
        songId,
        isFavorite: Boolean(favorite),
      },
    });
  } catch (error) {
    console.error("Check favorite song error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengecek status favorite song",
    });
  }
};

export {
  addFavoriteSong,
  checkFavoriteSong,
  getFavoriteSongs,
  removeFavoriteSong,
};