import "dotenv/config";

import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Soundify API is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);

  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);

  process.exit(1);
});