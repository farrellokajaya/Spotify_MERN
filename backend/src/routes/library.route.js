import { Router } from "express";

import {
  addFavoriteSong,
  checkFavoriteSong,
  getFavoriteSongs,
  removeFavoriteSong,
} from "../controllers/library.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/favorites", getFavoriteSongs);
router.post("/favorites/:songId", addFavoriteSong);
router.delete("/favorites/:songId", removeFavoriteSong);
router.get("/favorites/check/:songId", checkFavoriteSong);

export default router;