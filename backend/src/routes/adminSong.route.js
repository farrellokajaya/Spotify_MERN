import { Router } from "express";

import {
  createAdminSong,
  deleteAdminSong,
  getAdminSongById,
  getAdminSongs,
  updateAdminSong,
} from "../controllers/adminSong.controller.js";

import validateRequest from "../middlewares/validateRequest.middleware.js";

import {
  songBodyValidation,
  songIdValidation,
} from "../validators/song.validator.js";

const router = Router();

router.get("/", getAdminSongs);

router.get(
  "/:id",
  songIdValidation,
  validateRequest,
  getAdminSongById,
);

router.post(
  "/",
  songBodyValidation,
  validateRequest,
  createAdminSong,
);

router.put(
  "/:id",
  songIdValidation,
  songBodyValidation,
  validateRequest,
  updateAdminSong,
);

router.delete(
  "/:id",
  songIdValidation,
  validateRequest,
  deleteAdminSong,
);

export default router;