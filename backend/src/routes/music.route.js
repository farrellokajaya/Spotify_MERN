import { Router } from "express";

import {
  getMusicHome,
  searchMusic,
} from "../controllers/music.controller.js";

const router = Router();

router.get("/home", getMusicHome);
router.get("/search", searchMusic);

export default router;