import { body, param } from "express-validator";
import mongoose from "mongoose";

const sanitizeGenres = (value) => {
  if (Array.isArray(value)) {
    return value.map((genre) => String(genre).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((genre) => genre.trim())
      .filter(Boolean);
  }

  return value;
};

const artistIdValidation = [
  param("id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("ID artist tidak valid"),
];

const artistBodyValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Nama artist wajib diisi")
    .bail()
    .isLength({ min: 2, max: 80 })
    .withMessage("Nama artist harus terdiri dari 2 sampai 80 karakter"),

  body("bio")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Bio maksimal 1000 karakter"),

  body("imageUrl")
    .optional({ values: "falsy" })
    .trim()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage("Image URL harus berupa URL valid dengan http atau https"),

  body("genres")
    .optional()
    .customSanitizer(sanitizeGenres)
    .isArray({ max: 8 })
    .withMessage("Genre harus berupa array dan maksimal 8 item")
    .bail()
    .custom((genres) => {
      return genres.every((genre) => {
        return (
          typeof genre === "string" &&
          genre.length >= 1 &&
          genre.length <= 30
        );
      });
    })
    .withMessage("Setiap genre harus berupa teks 1 sampai 30 karakter"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("Status aktif harus berupa boolean")
    .bail()
    .toBoolean(),
];

export { artistBodyValidation, artistIdValidation };