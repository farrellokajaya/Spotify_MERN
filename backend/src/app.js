import cors from "cors";
import express from "express";

import authRoutes from "./routes/auth.route.js";
import healthRoutes from "./routes/health.route.js";

const app = express();

const clientUrl =
  process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: clientUrl,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

export default app;