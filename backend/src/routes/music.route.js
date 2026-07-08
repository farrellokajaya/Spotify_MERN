import { Router } from "express";

import {
  getMusicHome,
  getPublicAlbumDetail,
  getPublicArtistDetail,
  searchMusic,
} from "../controllers/music.controller.js";

const router = Router();

router.get("/home", getMusicHome);
router.get("/search", searchMusic);
router.get("/artists/:id", getPublicArtistDetail);
router.get("/albums/:id", getPublicAlbumDetail);

export default router;