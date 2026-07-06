import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama artist wajib diisi"],
      trim: true,
      minlength: [2, "Nama artist minimal 2 karakter"],
      maxlength: [80, "Nama artist maksimal 80 karakter"],
    },

    slug: {
      type: String,
      required: [true, "Slug artist wajib diisi"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug hanya boleh huruf kecil, angka, dan tanda hubung",
      ],
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio maksimal 1000 karakter"],
      default: "",
    },

    imageUrl: {
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
        message: "Genre artist maksimal 8 item",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

artistSchema.index({ name: 1 });

const Artist = mongoose.model("Artist", artistSchema);

export default Artist;