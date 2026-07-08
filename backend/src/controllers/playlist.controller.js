import mongoose from "mongoose";

import Playlist from "../models/playlist.model.js";
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

const getVisibleSongs = (playlist) => {
  return (playlist.songs || [])
    .filter((song) => Boolean(song && song.artist))
    .map(formatSong);
};

const formatPlaylistSummary = (playlist) => ({
  id: playlist._id,
  name: playlist.name,
  description: playlist.description,
  owner: playlist.owner,
  isPublic: playlist.isPublic,
  songCount: Array.isArray(playlist.songs) ? playlist.songs.length : 0,
  createdAt: playlist.createdAt,
  updatedAt: playlist.updatedAt,
});

const formatPlaylistDetail = (playlist) => ({
  id: playlist._id,
  name: playlist.name,
  description: playlist.description,
  owner: playlist.owner,
  isPublic: playlist.isPublic,
  songs: getVisibleSongs(playlist),
  songCount: getVisibleSongs(playlist).length,
  createdAt: playlist.createdAt,
  updatedAt: playlist.updatedAt,
});

const populatePlaylistSongs = (query) => {
  return query.populate({
    path: "songs",
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

const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .select("name description owner songs isPublic createdAt updatedAt");

    return res.status(200).json({
      success: true,
      message: "Playlist berhasil diambil",
      data: {
        playlists: playlists.map(formatPlaylistSummary),
      },
    });
  } catch (error) {
    console.error("Get playlists error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil playlist",
    });
  }
};

const getPlaylistDetail = async (req, res) => {
  try {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
      return res.status(400).json({
        success: false,
        message: "Playlist ID tidak valid",
      });
    }

    const playlist = await populatePlaylistSongs(
      Playlist.findOne({
        _id: playlistId,
        owner: req.user._id,
      }).select("name description owner songs isPublic createdAt updatedAt"),
    );

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail playlist berhasil diambil",
      data: {
        playlist: formatPlaylistDetail(playlist),
      },
    });
  } catch (error) {
    console.error("Get playlist detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail playlist",
    });
  }
};

const createPlaylist = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const isPublic = Boolean(req.body.isPublic);

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Nama playlist minimal 2 karakter",
      });
    }

    if (description.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Deskripsi playlist maksimal 500 karakter",
      });
    }

    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user._id,
      songs: [],
      isPublic,
    });

    return res.status(201).json({
      success: true,
      message: "Playlist berhasil dibuat",
      data: {
        playlist: formatPlaylistSummary(playlist),
      },
    });
  } catch (error) {
    console.error("Create playlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal membuat playlist",
    });
  }
};

const updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
      return res.status(400).json({
        success: false,
        message: "Playlist ID tidak valid",
      });
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
      const name = String(req.body.name || "").trim();

      if (name.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Nama playlist minimal 2 karakter",
        });
      }

      updates.name = name;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "description")) {
      const description = String(req.body.description || "").trim();

      if (description.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Deskripsi playlist maksimal 500 karakter",
        });
      }

      updates.description = description;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "isPublic")) {
      updates.isPublic = Boolean(req.body.isPublic);
    }

    const playlist = await Playlist.findOneAndUpdate(
      {
        _id: playlistId,
        owner: req.user._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      },
    ).select("name description owner songs isPublic createdAt updatedAt");

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Playlist berhasil diperbarui",
      data: {
        playlist: formatPlaylistSummary(playlist),
      },
    });
  } catch (error) {
    console.error("Update playlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui playlist",
    });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
      return res.status(400).json({
        success: false,
        message: "Playlist ID tidak valid",
      });
    }

    const playlist = await Playlist.findOneAndDelete({
      _id: playlistId,
      owner: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Playlist berhasil dihapus",
      data: {
        playlistId,
      },
    });
  } catch (error) {
    console.error("Delete playlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus playlist",
    });
  }
};

const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(songId)) {
      return res.status(400).json({
        success: false,
        message: "Playlist ID atau Song ID tidak valid",
      });
    }

    const playlist = await Playlist.findOne({
      _id: playlistId,
      owner: req.user._id,
    }).select("songs");

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist tidak ditemukan",
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

    const alreadyExists = playlist.songs.some((currentSongId) => {
      return String(currentSongId) === String(song._id);
    });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Song sudah ada di playlist ini",
      });
    }

    await Playlist.updateOne(
      {
        _id: playlist._id,
        owner: req.user._id,
      },
      {
        $addToSet: { songs: song._id },
      },
    );

    return res.status(200).json({
      success: true,
      message: "Song berhasil ditambahkan ke playlist",
      data: {
        playlistId,
        song: formatSong(song),
      },
    });
  } catch (error) {
    console.error("Add song to playlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan song ke playlist",
    });
  }
};

const removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(songId)) {
      return res.status(400).json({
        success: false,
        message: "Playlist ID atau Song ID tidak valid",
      });
    }

    const playlist = await Playlist.findOneAndUpdate(
      {
        _id: playlistId,
        owner: req.user._id,
      },
      {
        $pull: { songs: songId },
      },
      {
        new: true,
      },
    ).select("_id");

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Song berhasil dihapus dari playlist",
      data: {
        playlistId,
        songId,
      },
    });
  } catch (error) {
    console.error("Remove song from playlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus song dari playlist",
    });
  }
};

export {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistDetail,
  getUserPlaylists,
  removeSongFromPlaylist,
  updatePlaylist,
};