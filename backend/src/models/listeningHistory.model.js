import mongoose from "mongoose";

const listeningHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User history wajib diisi"],
    },

    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: [true, "Song history wajib diisi"],
    },

    playedAt: {
      type: Date,
      default: Date.now,
      required: [true, "Waktu play wajib diisi"],
    },
  },
  {
    timestamps: true,
  },
);

listeningHistorySchema.index({ user: 1, song: 1 }, { unique: true });
listeningHistorySchema.index({ user: 1, playedAt: -1 });

const ListeningHistory = mongoose.model(
  "ListeningHistory",
  listeningHistorySchema,
);

export default ListeningHistory;