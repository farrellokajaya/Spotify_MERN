import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Judul lagu wajib diisi"],
      trim: true,
      minlength: [1, "Judul lagu minimal 1 karakter"],
      maxlength: [120, "Judul lagu maksimal 120 karakter"],
    },

    slug: {
      type: String,
      required: [true, "Slug lagu wajib diisi"],
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug hanya boleh huruf kecil, angka, dan tanda hubung",
      ],
    },

    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: [true, "Artist lagu wajib diisi"],
    },

    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      default: null,
    },

    durationSeconds: {
      type: Number,
      required: [true, "Durasi lagu wajib diisi"],
      min: [1, "Durasi lagu minimal 1 detik"],
      max: [7200, "Durasi lagu maksimal 2 jam"],
    },

    trackNumber: {
      type: Number,
      min: [1, "Nomor track minimal 1"],
      default: null,
    },

    audioUrl: {
      type: String,
      required: [true, "Audio URL wajib diisi"],
      trim: true,
    },

    coverImageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    lyrics: {
      type: String,
      trim: true,
      default: "",
    },

    genres: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return value.length <= 8;
        },
        message: "Genre lagu maksimal 8 item",
      },
    },

    playCount: {
      type: Number,
      default: 0,
      min: [0, "Play count tidak boleh negatif"],
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

songSchema.index({ artist: 1, title: 1 });
songSchema.index({ album: 1, trackNumber: 1 });
songSchema.index({ slug: 1 });
songSchema.index({ isPublished: 1, createdAt: -1 });

const Song = mongoose.model("Song", songSchema);

export default Song;