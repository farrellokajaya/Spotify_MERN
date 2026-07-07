import { Router } from "express";

import {
  uploadAdminAudio,
  uploadAdminImage,
} from "../controllers/adminUpload.controller.js";
import {
  uploadAudioFile,
  uploadImageFile,
} from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/image", uploadImageFile, uploadAdminImage);
router.post("/audio", uploadAudioFile, uploadAdminAudio);

export default router;