import express from "express";
import cors from "cors";
import morgan from "morgan";

import adminRouter from "./routes/admin.route.js";
import authRouter from "./routes/auth.route.js";
import healthRouter from "./routes/health.route.js";
import libraryRouter from "./routes/library.route.js";
import musicRouter from "./routes/music.route.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found`,
  });
});

export default app;