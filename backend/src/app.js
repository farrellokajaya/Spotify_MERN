import express from "express";
import cors from "cors";
import morgan from "morgan";

import adminRouter from "./routes/admin.route.js";
import authRouter from "./routes/auth.route.js";
import healthRouter from "./routes/health.route.js";
import historyRouter from "./routes/history.route.js";
import libraryRouter from "./routes/library.route.js";
import musicRouter from "./routes/music.route.js";
import playlistRouter from "./routes/playlist.route.js";

const app = express();

const getAllowedOrigins = () => {
  const rawOrigins =
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173";

  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = getAllowedOrigins();

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Soundify API",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/music", musicRouter);
app.use("/api/library", libraryRouter);
app.use("/api/playlists", playlistRouter);
app.use("/api/history", historyRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found`,
  });
});

app.use((error, req, res, next) => {
  if (error.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      success: false,
      message: "Origin tidak diizinkan mengakses Soundify API",
    });
  }

  console.error("Unhandled API error:", error);

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
});

export default app;