import Album from "../models/album.model.js";
import Artist from "../models/artist.model.js";
import Song from "../models/song.model.js";
import { generateSlug, normalizeText } from "../utils/slug.js";

const formatArtistOption = (artist) => ({
  id: artist._id,
  name: artist.name,
  slug: artist.slug,
});

const formatAlbum = (album) => ({
  id: album._id,
  title: album.title,
  slug: album.slug,
  artist: album.artist ? formatArtistOption(album.artist) : null,
  description: album.description,
  coverImageUrl: album.coverImageUrl,
  releaseDate: album.releaseDate,
  type: album.type,
  genres: album.genres,
  isPublished: album.isPublished,
  createdAt: album.createdAt,
  updatedAt: album.updatedAt,
});

const buildUniqueSlug = async (
  title,
  artistId,
  ignoredAlbumId = null,
) => {
  const baseSlug = generateSlug(title, "album");
  let slug = baseSlug;
  let counter = 2;

  const query = ignoredAlbumId
    ? { artist: artistId, slug, _id: { $ne: ignoredAlbumId } }
    : { artist: artistId, slug };

  while (await Album.exists(query)) {
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

const handleDuplicateAlbumError = (error, res) => {
  if (error.code !== 11000) {
    return false;
  }

  if (error.keyPattern?.artist && error.keyPattern?.normalizedTitle) {
    res.status(409).json({
      success: false,
      message: "Album dengan judul tersebut sudah ada pada artist yang sama",
    });

    return true;
  }

  if (error.keyPattern?.artist && error.keyPattern?.slug) {
    res.status(409).json({
      success: false,
      message: "Slug album pada artist tersebut sudah digunakan. Silakan coba simpan ulang",
    });

    return true;
  }

  res.status(409).json({
    success: false,
    message: "Data album sudah digunakan",
  });

  return true;
};

const getAdminAlbums = async (req, res) => {
  try {
    const albums = await Album.find()
      .sort({ createdAt: -1 })
      .populate("artist", "name slug")
      .select(
        "title slug artist description coverImageUrl releaseDate type genres isPublished createdAt updatedAt",
      );

    return res.status(200).json({
      success: true,
      message: "Data album berhasil diambil",
      data: {
        albums: albums.map(formatAlbum),
      },
    });
  } catch (error) {
    console.error("Get admin albums error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data album",
    });
  }
};

const getAdminAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate("artist", "name slug")
      .select(
        "title slug artist description coverImageUrl releaseDate type genres isPublished createdAt updatedAt",
      );

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail album berhasil diambil",
      data: {
        album: formatAlbum(album),
      },
    });
  } catch (error) {
    console.error("Get admin album detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail album",
    });
  }
};

const createAdminAlbum = async (req, res) => {
  try {
    const {
      title,
      artist,
      description = "",
      coverImageUrl = "",
      releaseDate = null,
      type = "album",
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

    const normalizedTitle = normalizeText(title);

    const existingAlbum = await Album.exists({
      artist: activeArtist._id,
      normalizedTitle,
    });

    if (existingAlbum) {
      return res.status(409).json({
        success: false,
        message: "Album dengan judul tersebut sudah ada pada artist yang sama",
      });
    }

    const slug = await buildUniqueSlug(title, activeArtist._id);

    const album = await Album.create({
      title,
      normalizedTitle,
      slug,
      artist: activeArtist._id,
      description,
      coverImageUrl,
      releaseDate: releaseDate || null,
      type,
      genres,
      isPublished,
    });

    await album.populate("artist", "name slug");

    return res.status(201).json({
      success: true,
      message: "Album berhasil ditambahkan",
      data: {
        album: formatAlbum(album),
      },
    });
  } catch (error) {
    if (handleDuplicateAlbumError(error, res)) {
      return undefined;
    }

    console.error("Create admin album error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan album",
    });
  }
};

const updateAdminAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).select(
      "+normalizedTitle",
    );

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album tidak ditemukan",
      });
    }

    const {
      title,
      artist,
      description = "",
      coverImageUrl = "",
      releaseDate = null,
      type = "album",
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

    const normalizedTitle = normalizeText(title);
    const artistChanged = String(activeArtist._id) !== String(album.artist);
    const titleChanged = normalizedTitle !== album.normalizedTitle;

    if (artistChanged || titleChanged) {
      const existingAlbum = await Album.exists({
        _id: { $ne: album._id },
        artist: activeArtist._id,
        normalizedTitle,
      });

      if (existingAlbum) {
        return res.status(409).json({
          success: false,
          message: "Album dengan judul tersebut sudah ada pada artist yang sama",
        });
      }

      album.title = title;
      album.normalizedTitle = normalizedTitle;
      album.artist = activeArtist._id;
      album.slug = await buildUniqueSlug(
        title,
        activeArtist._id,
        album._id,
      );
    }

    album.description = description;
    album.coverImageUrl = coverImageUrl;
    album.releaseDate = releaseDate || null;
    album.type = type;
    album.genres = genres;
    album.isPublished = isPublished;

    await album.save();
    await album.populate("artist", "name slug");

    return res.status(200).json({
      success: true,
      message: "Album berhasil diperbarui",
      data: {
        album: formatAlbum(album),
      },
    });
  } catch (error) {
    if (handleDuplicateAlbumError(error, res)) {
      return undefined;
    }

    console.error("Update admin album error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui album",
    });
  }
};

const deleteAdminAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate(
      "artist",
      "name slug",
    );

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album tidak ditemukan",
      });
    }

    const songCount = await Song.countDocuments({ album: album._id });

    if (songCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Album tidak bisa dihapus karena masih memiliki lagu",
      });
    }

    const deletedAlbum = formatAlbum(album);

    await album.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Album berhasil dihapus",
      data: {
        album: deletedAlbum,
      },
    });
  } catch (error) {
    console.error("Delete admin album error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus album",
    });
  }
};

export {
  createAdminAlbum,
  deleteAdminAlbum,
  getAdminAlbumById,
  getAdminAlbums,
  updateAdminAlbum,
};