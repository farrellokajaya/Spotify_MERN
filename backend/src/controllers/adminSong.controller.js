import Album from "../models/album.model.js";
import Artist from "../models/artist.model.js";
import Song from "../models/song.model.js";
import { generateSlug, normalizeText } from "../utils/slug.js";

const formatArtistOption = (artist) => ({
  id: artist._id,
  name: artist.name,
  slug: artist.slug,
});

const formatAlbumOption = (album) => ({
  id: album._id,
  title: album.title,
  slug: album.slug,
});

const formatSong = (song) => ({
  id: song._id,
  title: song.title,
  slug: song.slug,
  artist: song.artist ? formatArtistOption(song.artist) : null,
  album: song.album ? formatAlbumOption(song.album) : null,
  durationSeconds: song.durationSeconds,
  trackNumber: song.trackNumber,
  audioUrl: song.audioUrl,
  coverImageUrl: song.coverImageUrl,
  lyrics: song.lyrics,
  genres: song.genres,
  playCount: song.playCount,
  isPublished: song.isPublished,
  createdAt: song.createdAt,
  updatedAt: song.updatedAt,
});

const buildUniqueSlug = async (
  title,
  artistId,
  ignoredSongId = null,
) => {
  const baseSlug = generateSlug(title, "song");
  let slug = baseSlug;
  let counter = 2;

  const query = ignoredSongId
    ? { artist: artistId, slug, _id: { $ne: ignoredSongId } }
    : { artist: artistId, slug };

  while (await Song.exists(query)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
    query.slug = slug;
  }

  return slug;
};

const getActiveArtistById = async (artistId) => {
  return Artist.findOne({
    _id: artistId,
    isActive: true,
  }).select("name slug isActive");
};

const getAlbumByArtist = async (albumId, artistId) => {
  if (!albumId) {
    return null;
  }

  return Album.findOne({
    _id: albumId,
    artist: artistId,
  }).select("title slug artist");
};

const ensureTrackNumberAvailable = async ({
  albumId,
  trackNumber,
  ignoredSongId = null,
}) => {
  if (!albumId || !trackNumber) {
    return true;
  }

  const query = ignoredSongId
    ? {
        _id: { $ne: ignoredSongId },
        album: albumId,
        trackNumber,
      }
    : {
        album: albumId,
        trackNumber,
      };

  const existingTrack = await Song.exists(query);

  return !existingTrack;
};

const handleDuplicateSongError = (error, res) => {
  if (error.code !== 11000) {
    return false;
  }

  if (error.keyPattern?.artist && error.keyPattern?.normalizedTitle) {
    res.status(409).json({
      success: false,
      message: "Lagu dengan judul tersebut sudah ada pada artist yang sama",
    });

    return true;
  }

  if (error.keyPattern?.artist && error.keyPattern?.slug) {
    res.status(409).json({
      success: false,
      message: "Slug lagu pada artist tersebut sudah digunakan. Silakan coba simpan ulang",
    });

    return true;
  }

  res.status(409).json({
    success: false,
    message: "Data lagu sudah digunakan",
  });

  return true;
};

const getAdminSongs = async (req, res) => {
  try {
    const songs = await Song.find()
      .sort({ createdAt: -1 })
      .populate("artist", "name slug")
      .populate("album", "title slug")
      .select(
        "title slug artist album durationSeconds trackNumber audioUrl coverImageUrl lyrics genres playCount isPublished createdAt updatedAt",
      );

    return res.status(200).json({
      success: true,
      message: "Data lagu berhasil diambil",
      data: {
        songs: songs.map(formatSong),
      },
    });
  } catch (error) {
    console.error("Get admin songs error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data lagu",
    });
  }
};

const getAdminSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("artist", "name slug")
      .populate("album", "title slug")
      .select(
        "title slug artist album durationSeconds trackNumber audioUrl coverImageUrl lyrics genres playCount isPublished createdAt updatedAt",
      );

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Lagu tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail lagu berhasil diambil",
      data: {
        song: formatSong(song),
      },
    });
  } catch (error) {
    console.error("Get admin song detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail lagu",
    });
  }
};

const createAdminSong = async (req, res) => {
  try {
    const {
      title,
      artist,
      album = null,
      durationSeconds,
      trackNumber = null,
      audioUrl,
      coverImageUrl = "",
      lyrics = "",
      genres = [],
      isPublished = false,
    } = req.body;

    const activeArtist = await getActiveArtistById(artist);

    if (!activeArtist) {
      return res.status(404).json({
        success: false,
        message: "Artist aktif tidak ditemukan",
      });
    }

    const albumId = album || null;
    const selectedAlbum = await getAlbumByArtist(albumId, activeArtist._id);

    if (albumId && !selectedAlbum) {
      return res.status(400).json({
        success: false,
        message: "Album tidak ditemukan atau tidak sesuai dengan artist yang dipilih",
      });
    }

    const normalizedTitle = normalizeText(title);

    const existingSong = await Song.exists({
      artist: activeArtist._id,
      normalizedTitle,
    });

    if (existingSong) {
      return res.status(409).json({
        success: false,
        message: "Lagu dengan judul tersebut sudah ada pada artist yang sama",
      });
    }

    const trackAvailable = await ensureTrackNumberAvailable({
      albumId,
      trackNumber,
    });

    if (!trackAvailable) {
      return res.status(409).json({
        success: false,
        message: "Nomor track sudah digunakan pada album tersebut",
      });
    }

    const slug = await buildUniqueSlug(title, activeArtist._id);

    const song = await Song.create({
      title,
      normalizedTitle,
      slug,
      artist: activeArtist._id,
      album: albumId,
      durationSeconds,
      trackNumber: trackNumber || null,
      audioUrl,
      coverImageUrl,
      lyrics,
      genres,
      isPublished,
    });

    await song.populate("artist", "name slug");
    await song.populate("album", "title slug");

    return res.status(201).json({
      success: true,
      message: "Lagu berhasil ditambahkan",
      data: {
        song: formatSong(song),
      },
    });
  } catch (error) {
    if (handleDuplicateSongError(error, res)) {
      return undefined;
    }

    console.error("Create admin song error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan lagu",
    });
  }
};

const updateAdminSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).select(
      "+normalizedTitle",
    );

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Lagu tidak ditemukan",
      });
    }

    const {
      title,
      artist,
      album = null,
      durationSeconds,
      trackNumber = null,
      audioUrl,
      coverImageUrl = "",
      lyrics = "",
      genres = [],
      isPublished = false,
    } = req.body;

    const activeArtist = await getActiveArtistById(artist);

    if (!activeArtist) {
      return res.status(404).json({
        success: false,
        message: "Artist aktif tidak ditemukan",
      });
    }

    const albumId = album || null;
    const selectedAlbum = await getAlbumByArtist(albumId, activeArtist._id);

    if (albumId && !selectedAlbum) {
      return res.status(400).json({
        success: false,
        message: "Album tidak ditemukan atau tidak sesuai dengan artist yang dipilih",
      });
    }

    const normalizedTitle = normalizeText(title);
    const artistChanged = String(activeArtist._id) !== String(song.artist);
    const titleChanged = normalizedTitle !== song.normalizedTitle;

    if (artistChanged || titleChanged) {
      const existingSong = await Song.exists({
        _id: { $ne: song._id },
        artist: activeArtist._id,
        normalizedTitle,
      });

      if (existingSong) {
        return res.status(409).json({
          success: false,
          message: "Lagu dengan judul tersebut sudah ada pada artist yang sama",
        });
      }

      song.title = title;
      song.normalizedTitle = normalizedTitle;
      song.artist = activeArtist._id;
      song.slug = await buildUniqueSlug(title, activeArtist._id, song._id);
    }

    const trackAvailable = await ensureTrackNumberAvailable({
      albumId,
      trackNumber,
      ignoredSongId: song._id,
    });

    if (!trackAvailable) {
      return res.status(409).json({
        success: false,
        message: "Nomor track sudah digunakan pada album tersebut",
      });
    }

    song.album = albumId;
    song.durationSeconds = durationSeconds;
    song.trackNumber = trackNumber || null;
    song.audioUrl = audioUrl;
    song.coverImageUrl = coverImageUrl;
    song.lyrics = lyrics;
    song.genres = genres;
    song.isPublished = isPublished;

    await song.save();
    await song.populate("artist", "name slug");
    await song.populate("album", "title slug");

    return res.status(200).json({
      success: true,
      message: "Lagu berhasil diperbarui",
      data: {
        song: formatSong(song),
      },
    });
  } catch (error) {
    if (handleDuplicateSongError(error, res)) {
      return undefined;
    }

    console.error("Update admin song error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui lagu",
    });
  }
};

const deleteAdminSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("artist", "name slug")
      .populate("album", "title slug");

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Lagu tidak ditemukan",
      });
    }

    const deletedSong = formatSong(song);

    await song.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Lagu berhasil dihapus",
      data: {
        song: deletedSong,
      },
    });
  } catch (error) {
    console.error("Delete admin song error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus lagu",
    });
  }
};

export {
  createAdminSong,
  deleteAdminSong,
  getAdminSongById,
  getAdminSongs,
  updateAdminSong,
};