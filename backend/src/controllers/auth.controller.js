import User from "../models/user.model.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.exists({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    /*
     * Tetap tangani duplicate-key error karena dua request
     * bisa saja memeriksa email yang sama secara bersamaan.
     */
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    console.error("Register user error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat melakukan registrasi",
    });
  }
};

export { registerUser };