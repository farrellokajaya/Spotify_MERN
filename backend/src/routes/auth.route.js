import { Router } from "express";

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../controllers/auth.controller.js";

import protect from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validateRequest.middleware.js";

import {
  loginValidation,
  registerValidation,
} from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/register",
  registerValidation,
  validateRequest,
  registerUser
);

router.post(
  "/login",
  loginValidation,
  validateRequest,
  loginUser
);

router.get(
  "/me",
  protect,
  getCurrentUser
);

export default router;