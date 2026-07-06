import { Router } from "express";

import {
  createAdminAlbum,
  deleteAdminAlbum,
  getAdminAlbumById,
  getAdminAlbums,
  updateAdminAlbum,
} from "../controllers/adminAlbum.controller.js";

import validateRequest from "../middlewares/validateRequest.middleware.js";

import {
  albumBodyValidation,
  albumIdValidation,
} from "../validators/album.validator.js";

const router = Router();

router.get("/", getAdminAlbums);

router.get(
  "/:id",
  albumIdValidation,
  validateRequest,
  getAdminAlbumById,
);

router.post(
  "/",
  albumBodyValidation,
  validateRequest,
  createAdminAlbum,
);

router.put(
  "/:id",
  albumIdValidation,
  albumBodyValidation,
  validateRequest,
  updateAdminAlbum,
);

router.delete(
  "/:id",
  albumIdValidation,
  validateRequest,
  deleteAdminAlbum,
);

export default router;