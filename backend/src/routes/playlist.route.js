import { Router } from "express";

import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistDetail,
  getUserPlaylists,
  removeSongFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getUserPlaylists);
router.post("/", createPlaylist);
router.get("/:playlistId", getPlaylistDetail);
router.put("/:playlistId", updatePlaylist);
router.delete("/:playlistId", deletePlaylist);
router.post("/:playlistId/songs/:songId", addSongToPlaylist);
router.delete("/:playlistId/songs/:songId", removeSongFromPlaylist);

export default router;