import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama playlist wajib diisi"],
      trim: true,
      minlength: [2, "Nama playlist minimal 2 karakter"],
      maxlength: [80, "Nama playlist maksimal 80 karakter"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Deskripsi playlist maksimal 500 karakter"],
      default: "",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner playlist wajib diisi"],
    },

    songs: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Song",
        },
      ],
      default: [],
    },

    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

playlistSchema.index({ owner: 1, createdAt: -1 });
playlistSchema.index({ owner: 1, name: 1 });
playlistSchema.index({ isPublic: 1, createdAt: -1 });

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;