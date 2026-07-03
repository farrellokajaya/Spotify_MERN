import jwt from "jsonwebtoken";

import User from "../models/user.model.js";

const protect = async (req, res, next) => {
  try {
    const authorizationHeader =
      req.headers.authorization;

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Token autentikasi tidak ditemukan",
      });
    }

    const token = authorizationHeader
      .slice(7)
      .trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token autentikasi tidak ditemukan",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET tidak ditemukan pada environment"
      );
    }

    const decodedToken = jwt.verify(
      token,
      jwtSecret,
      {
        algorithms: ["HS256"],
        issuer: "soundify-api",
        audience: "soundify-client",
      }
    );

    const user = await User.findById(
      decodedToken.sub
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Pengguna dari token tidak ditemukan",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Akun pengguna sedang dinonaktifkan",
      });
    }

    req.user = user;

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message:
          "Token autentikasi sudah kedaluwarsa",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token autentikasi tidak valid",
      });
    }

    console.error(
      "Authentication middleware error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan saat memverifikasi autentikasi",
    });
  }
};

export default protect;