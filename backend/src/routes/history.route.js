import { Router } from "express";

import {
  clearRecentlyPlayed,
  getRecentlyPlayed,
  recordSongPlay,
} from "../controllers/history.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/recent", getRecentlyPlayed);
router.post("/songs/:songId", recordSongPlay);
router.delete("/clear", clearRecentlyPlayed);

export default router;