import "dotenv/config";
import mongoose from "mongoose";

import connectDatabase from "../config/db.js";
import User from "../models/user.model.js";

const TEST_EMAIL = "model-test@soundify.local";
const TEST_PASSWORD = "SoundifyTest123!";

const testUserModel = async () => {
  try {
    await connectDatabase();

    // Menghapus data pengujian lama jika sebelumnya belum terhapus.
    await User.deleteOne({
      email: TEST_EMAIL,
    });

    const createdUser = await User.create({
      name: "Soundify Test User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      role: "user",
    });

    const savedUser = await User.findById(
      createdUser._id
    ).select("+password");

    if (!savedUser) {
      throw new Error("User pengujian tidak ditemukan");
    }

    const passwordIsHashed =
      savedUser.password !== TEST_PASSWORD;

    const passwordMatches =
      await savedUser.comparePassword(TEST_PASSWORD);

    console.log("\nUser Model Test");
    console.log("------------------------------");
    console.log(`User ID          : ${savedUser._id}`);
    console.log(`Name             : ${savedUser.name}`);
    console.log(`Email            : ${savedUser.email}`);
    console.log(`Role             : ${savedUser.role}`);
    console.log(`Password hashed  : ${passwordIsHashed}`);
    console.log(`Password matches : ${passwordMatches}`);
    console.log("------------------------------");

    await User.deleteOne({
      _id: savedUser._id,
    });

    console.log("Data pengujian berhasil dihapus.");
  } catch (error) {
    console.error(`User Model Test gagal: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("Koneksi MongoDB ditutup.");
  }
};

testUserModel();