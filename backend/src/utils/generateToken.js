import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET tidak ditemukan. Periksa file backend/.env"
    );
  }

  return jwt.sign(
    {},
    jwtSecret,
    {
      subject: userId.toString(),
      expiresIn: jwtExpiresIn,
      algorithm: "HS256",
      issuer: "soundify-api",
      audience: "soundify-client",
    }
  );
};

export default generateToken;