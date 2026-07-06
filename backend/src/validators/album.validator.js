import { body, param } from "express-validator";
import mongoose from "mongoose";

const albumTypes = ["album", "ep", "single"];

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

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const albumIdValidation = [
  param("id")
    .custom(isValidObjectId)
    .withMessage("ID album tidak valid"),
];

const albumBodyValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Judul album wajib diisi")
    .bail()
    .isLength({ min: 2, max: 120 })
    .withMessage("Judul album harus terdiri dari 2 sampai 120 karakter"),

  body("artist")
    .trim()
    .notEmpty()
    .withMessage("Artist album wajib dipilih")
    .bail()
    .custom(isValidObjectId)
    .withMessage("ID artist tidak valid"),

  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1200 })
    .withMessage("Deskripsi maksimal 1200 karakter"),

  body("coverImageUrl")
    .optional({ values: "falsy" })
    .trim()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage("Cover image URL harus berupa URL valid dengan http atau https"),

  body("releaseDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Tanggal rilis harus menggunakan format tanggal yang valid"),

  body("type")
    .optional()
    .isIn(albumTypes)
    .withMessage("Tipe album harus album, ep, atau single"),

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

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("Status publikasi harus berupa boolean")
    .bail()
    .toBoolean(),
];

export { albumBodyValidation, albumIdValidation };