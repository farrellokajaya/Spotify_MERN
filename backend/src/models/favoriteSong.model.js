import mongoose from "mongoose";

const favoriteSongSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User favorite wajib diisi"],
    },

    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: [true, "Song favorite wajib diisi"],
    },
  },
  {
    timestamps: true,
  },
);

favoriteSongSchema.index({ user: 1, song: 1 }, { unique: true });
favoriteSongSchema.index({ user: 1, createdAt: -1 });

const FavoriteSong = mongoose.model("FavoriteSong", favoriteSongSchema);

export default FavoriteSong;