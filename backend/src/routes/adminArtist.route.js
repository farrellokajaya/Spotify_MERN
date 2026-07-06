import { Router } from "express";

import {
  createAdminArtist,
  deleteAdminArtist,
  getAdminArtistById,
  getAdminArtists,
  updateAdminArtist,
} from "../controllers/adminArtist.controller.js";

import validateRequest from "../middlewares/validateRequest.middleware.js";

import {
  artistBodyValidation,
  artistIdValidation,
} from "../validators/artist.validator.js";

const router = Router();

router.get("/", getAdminArtists);

router.get(
  "/:id",
  artistIdValidation,
  validateRequest,
  getAdminArtistById,
);

router.post(
  "/",
  artistBodyValidation,
  validateRequest,
  createAdminArtist,
);

router.put(
  "/:id",
  artistIdValidation,
  artistBodyValidation,
  validateRequest,
  updateAdminArtist,
);

router.delete(
  "/:id",
  artistIdValidation,
  validateRequest,
  deleteAdminArtist,
);

export default router;