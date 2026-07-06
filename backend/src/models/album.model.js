import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Judul album wajib diisi"],
      trim: true,
      minlength: [2, "Judul album minimal 2 karakter"],
      maxlength: [120, "Judul album maksimal 120 karakter"],
    },

    normalizedTitle: {
      type: String,
      required: [true, "Judul album wajib diisi"],
      minlength: [2, "Judul album minimal 2 karakter"],
      maxlength: [120, "Judul album maksimal 120 karakter"],
    },

    slug: {
      type: String,
      required: [true, "Slug album wajib diisi"],
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
      required: [true, "Artist album wajib diisi"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1200, "Deskripsi maksimal 1200 karakter"],
      default: "",
    },

    coverImageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    releaseDate: {
      type: Date,
      default: null,
    },

    type: {
      type: String,
      enum: {
        values: ["album", "ep", "single"],
        message: "Tipe harus album, ep, atau single",
      },
      default: "album",
    },

    genres: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return value.length <= 8;
        },
        message: "Genre album maksimal 8 item",
      },
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

albumSchema.index(
  { artist: 1, normalizedTitle: 1 },
  { unique: true },
);

albumSchema.index({ artist: 1, slug: 1 }, { unique: true });
albumSchema.index({ artist: 1, title: 1 });
albumSchema.index({ releaseDate: -1 });
albumSchema.index({ isPublished: 1, createdAt: -1 });

const Album = mongoose.model("Album", albumSchema);

export default Album;