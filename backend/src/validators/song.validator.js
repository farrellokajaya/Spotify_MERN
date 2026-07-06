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

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const songIdValidation = [
  param("id")
    .custom(isValidObjectId)
    .withMessage("ID lagu tidak valid"),
];

const songBodyValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Judul lagu wajib diisi")
    .bail()
    .isLength({ min: 1, max: 120 })
    .withMessage("Judul lagu harus terdiri dari 1 sampai 120 karakter"),

  body("artist")
    .trim()
    .notEmpty()
    .withMessage("Artist lagu wajib dipilih")
    .bail()
    .custom(isValidObjectId)
    .withMessage("ID artist tidak valid"),

  body("album")
    .optional({ values: "falsy" })
    .custom(isValidObjectId)
    .withMessage("ID album tidak valid"),

  body("durationSeconds")
    .notEmpty()
    .withMessage("Durasi lagu wajib diisi")
    .bail()
    .isInt({ min: 1, max: 7200 })
    .withMessage("Durasi lagu harus berupa angka 1 sampai 7200 detik")
    .toInt(),

  body("trackNumber")
    .optional({ values: "falsy" })
    .isInt({ min: 1, max: 999 })
    .withMessage("Nomor track harus berupa angka 1 sampai 999")
    .toInt(),

  body("audioUrl")
    .trim()
    .notEmpty()
    .withMessage("Audio URL wajib diisi")
    .bail()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage("Audio URL harus berupa URL valid dengan http atau https"),

  body("coverImageUrl")
    .optional({ values: "falsy" })
    .trim()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage("Cover image URL harus berupa URL valid dengan http atau https"),

  body("lyrics")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 10000 })
    .withMessage("Lirik maksimal 10000 karakter"),

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

export { songBodyValidation, songIdValidation };