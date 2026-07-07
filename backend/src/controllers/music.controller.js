import Album from "../models/album.model.js";
import Artist from "../models/artist.model.js";
import Song from "../models/song.model.js";

const escapeRegex = (value) => {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildSearchRegex = (query) => {
  return new RegExp(escapeRegex(query.trim()), "i");
};

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
  artist: album.artist ? formatArtist(album.artist) : null,
  description: album.description,
  coverImageUrl: album.coverImageUrl,
  releaseDate: album.releaseDate,
  type: album.type,
  genres: album.genres,
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
});

const removeItemsWithoutActiveArtist = (items) => {
  return items.filter((item) => Boolean(item.artist));
};

const getMusicHome = async (req, res) => {
  try {
    const [songs, albums, artists] = await Promise.all([
      Song.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({
          path: "artist",
          match: { isActive: true },
          select: "name slug bio imageUrl genres",
        })
        .populate({
          path: "album",
          select: "title slug coverImageUrl type",
        })
        .select(
          "title slug artist album durationSeconds trackNumber audioUrl coverImageUrl genres playCount createdAt",
        ),

      Album.find({ isPublished: true })
        .sort({ releaseDate: -1, createdAt: -1 })
        .limit(10)
        .populate({
          path: "artist",
          match: { isActive: true },
          select: "name slug bio imageUrl genres",
        })
        .select(
          "title slug artist description coverImageUrl releaseDate type genres createdAt",
        ),

      Artist.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("name slug bio imageUrl genres"),
    ]);

    const visibleSongs = removeItemsWithoutActiveArtist(songs);
    const visibleAlbums = removeItemsWithoutActiveArtist(albums);

    return res.status(200).json({
      success: true,
      message: "Data musik berhasil diambil",
      data: {
        songs: visibleSongs.map(formatSong),
        albums: visibleAlbums.map(formatAlbum),
        artists: artists.map(formatArtist),
      },
    });
  } catch (error) {
    console.error("Get music home error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data musik",
    });
  }
};

const searchMusic = async (req, res) => {
  try {
    const query = String(req.query.query || "").trim();

    if (query.length < 2) {
      return res.status(200).json({
        success: true,
        message: "Masukkan minimal 2 karakter untuk mencari musik",
        data: {
          query,
          songs: [],
          albums: [],
          artists: [],
        },
      });
    }

    const regex = buildSearchRegex(query);

    const [songs, albums, artists] = await Promise.all([
      Song.find({
        isPublished: true,
        $or: [
          { title: regex },
          { genres: regex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate({
          path: "artist",
          match: { isActive: true },
          select: "name slug bio imageUrl genres",
        })
        .populate({
          path: "album",
          select: "title slug coverImageUrl type",
        })
        .select(
          "title slug artist album durationSeconds trackNumber audioUrl coverImageUrl genres playCount createdAt",
        ),

      Album.find({
        isPublished: true,
        $or: [
          { title: regex },
          { genres: regex },
        ],
      })
        .sort({ releaseDate: -1, createdAt: -1 })
        .limit(20)
        .populate({
          path: "artist",
          match: { isActive: true },
          select: "name slug bio imageUrl genres",
        })
        .select(
          "title slug artist description coverImageUrl releaseDate type genres createdAt",
        ),

      Artist.find({
        isActive: true,
        $or: [
          { name: regex },
          { genres: regex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .select("name slug bio imageUrl genres"),
    ]);

    const visibleSongs = removeItemsWithoutActiveArtist(songs);
    const visibleAlbums = removeItemsWithoutActiveArtist(albums);

    return res.status(200).json({
      success: true,
      message: "Hasil pencarian musik berhasil diambil",
      data: {
        query,
        songs: visibleSongs.map(formatSong),
        albums: visibleAlbums.map(formatAlbum),
        artists: artists.map(formatArtist),
      },
    });
  } catch (error) {
    console.error("Search music error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mencari musik",
    });
  }
};

export { getMusicHome, searchMusic };