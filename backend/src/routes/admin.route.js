import { Router } from "express";

import protect from "../middlewares/auth.middleware.js";
import requireAdmin from "../middlewares/admin.middleware.js";

import User from "../models/user.model.js";
import Artist from "../models/artist.model.js";
import Album from "../models/album.model.js";
import Song from "../models/song.model.js";

import adminAlbumRouter from "./adminAlbum.route.js";
import adminArtistRouter from "./adminArtist.route.js";
import adminSongRouter from "./adminSong.route.js";

const router = Router();

router.use(protect);
router.use(requireAdmin);

router.get("/dashboard", async (req, res) => {
  try {
    const [userCount, artistCount, albumCount, songCount] =
      await Promise.all([
        User.countDocuments(),
        Artist.countDocuments(),
        Album.countDocuments(),
        Song.countDocuments(),
      ]);

    return res.status(200).json({
      success: true,
      message: "Data dashboard admin berhasil diambil",
      data: {
        users: userCount,
        artists: artistCount,
        albums: albumCount,
        songs: songCount,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data dashboard admin",
    });
  }
});

router.use("/artists", adminArtistRouter);
router.use("/albums", adminAlbumRouter);
router.use("/songs", adminSongRouter);

export default router;