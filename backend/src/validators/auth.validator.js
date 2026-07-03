import { body } from "express-validator";

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Nama wajib diisi")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("Nama harus terdiri dari 2 sampai 50 karakter"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email wajib diisi")
    .bail()
    .isEmail()
    .withMessage("Format email tidak valid")
    .bail()
    .customSanitizer((value) => value.toLowerCase()),

  body("password")
    .notEmpty()
    .withMessage("Password wajib diisi")
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage("Password harus terdiri dari 8 sampai 72 karakter")
    .bail()
    .matches(/[a-z]/)
    .withMessage("Password harus memiliki minimal satu huruf kecil")
    .bail()
    .matches(/[A-Z]/)
    .withMessage("Password harus memiliki minimal satu huruf besar")
    .bail()
    .matches(/[0-9]/)
    .withMessage("Password harus memiliki minimal satu angka"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email wajib diisi")
    .bail()
    .isEmail()
    .withMessage("Format email tidak valid")
    .bail()
    .customSanitizer((value) => value.toLowerCase()),

  body("password")
    .notEmpty()
    .withMessage("Password wajib diisi"),
];

export {
  registerValidation,
  loginValidation,
};