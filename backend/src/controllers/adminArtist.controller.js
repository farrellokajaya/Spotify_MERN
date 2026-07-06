import Album from "../models/album.model.js";
import Artist from "../models/artist.model.js";
import Song from "../models/song.model.js";
import { generateSlug, normalizeText } from "../utils/slug.js";

const formatArtist = (artist) => ({
  id: artist._id,
  name: artist.name,
  slug: artist.slug,
  bio: artist.bio,
  imageUrl: artist.imageUrl,
  genres: artist.genres,
  isActive: artist.isActive,
  createdAt: artist.createdAt,
  updatedAt: artist.updatedAt,
});

const buildUniqueSlug = async (name, ignoredArtistId = null) => {
  const baseSlug = generateSlug(name, "artist");
  let slug = baseSlug;
  let counter = 2;

  const query = ignoredArtistId
    ? { slug, _id: { $ne: ignoredArtistId } }
    : { slug };

  while (await Artist.exists(query)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
    query.slug = slug;
  }

  return slug;
};

const handleDuplicateArtistError = (error, res) => {
  if (error.code !== 11000) {
    return false;
  }

  if (error.keyPattern?.normalizedName) {
    res.status(409).json({
      success: false,
      message: "Artist dengan nama tersebut sudah ada",
    });

    return true;
  }

  if (error.keyPattern?.slug) {
    res.status(409).json({
      success: false,
      message: "Slug artist sudah digunakan. Silakan coba simpan ulang",
    });

    return true;
  }

  res.status(409).json({
    success: false,
    message: "Data artist sudah digunakan",
  });

  return true;
};

const getAdminArtists = async (req, res) => {
  try {
    const artists = await Artist.find()
      .sort({ createdAt: -1 })
      .select("name slug bio imageUrl genres isActive createdAt updatedAt");

    return res.status(200).json({
      success: true,
      message: "Data artist berhasil diambil",
      data: {
        artists: artists.map(formatArtist),
      },
    });
  } catch (error) {
    console.error("Get admin artists error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data artist",
    });
  }
};

const getAdminArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).select(
      "name slug bio imageUrl genres isActive createdAt updatedAt",
    );

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail artist berhasil diambil",
      data: {
        artist: formatArtist(artist),
      },
    });
  } catch (error) {
    console.error("Get admin artist detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail artist",
    });
  }
};

const createAdminArtist = async (req, res) => {
  try {
    const {
      name,
      bio = "",
      imageUrl = "",
      genres = [],
      isActive = true,
    } = req.body;

    const normalizedName = normalizeText(name);

    const existingArtist = await Artist.exists({ normalizedName });

    if (existingArtist) {
      return res.status(409).json({
        success: false,
        message: "Artist dengan nama tersebut sudah ada",
      });
    }

    const slug = await buildUniqueSlug(name);

    const artist = await Artist.create({
      name,
      normalizedName,
      slug,
      bio,
      imageUrl,
      genres,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: "Artist berhasil ditambahkan",
      data: {
        artist: formatArtist(artist),
      },
    });
  } catch (error) {
    if (handleDuplicateArtistError(error, res)) {
      return undefined;
    }

    console.error("Create admin artist error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan artist",
    });
  }
};

const updateAdminArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).select(
      "+normalizedName",
    );

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist tidak ditemukan",
      });
    }

    const {
      name,
      bio = "",
      imageUrl = "",
      genres = [],
      isActive = true,
    } = req.body;

    const normalizedName = normalizeText(name);

    if (normalizedName !== artist.normalizedName) {
      const existingArtist = await Artist.exists({
        _id: { $ne: artist._id },
        normalizedName,
      });

      if (existingArtist) {
        return res.status(409).json({
          success: false,
          message: "Artist dengan nama tersebut sudah ada",
        });
      }

      artist.name = name;
      artist.normalizedName = normalizedName;
      artist.slug = await buildUniqueSlug(name, artist._id);
    }

    artist.bio = bio;
    artist.imageUrl = imageUrl;
    artist.genres = genres;
    artist.isActive = isActive;

    await artist.save();

    return res.status(200).json({
      success: true,
      message: "Artist berhasil diperbarui",
      data: {
        artist: formatArtist(artist),
      },
    });
  } catch (error) {
    if (handleDuplicateArtistError(error, res)) {
      return undefined;
    }

    console.error("Update admin artist error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui artist",
    });
  }
};

const deleteAdminArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: "Artist tidak ditemukan",
      });
    }

    const [albumCount, songCount] = await Promise.all([
      Album.countDocuments({ artist: artist._id }),
      Song.countDocuments({ artist: artist._id }),
    ]);

    if (albumCount > 0 || songCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Artist tidak bisa dihapus karena masih memiliki album atau lagu",
      });
    }

    await artist.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Artist berhasil dihapus",
      data: {
        artist: formatArtist(artist),
      },
    });
  } catch (error) {
    console.error("Delete admin artist error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus artist",
    });
  }
};

export {
  createAdminArtist,
  deleteAdminArtist,
  getAdminArtistById,
  getAdminArtists,
  updateAdminArtist,
};