import { Router } from "express";

import { registerUser } from "../controllers/auth.controller.js";
import validateRequest from "../middlewares/validateRequest.middleware.js";
import { registerValidation } from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/register",
  registerValidation,
  validateRequest,
  registerUser
);

export default router;