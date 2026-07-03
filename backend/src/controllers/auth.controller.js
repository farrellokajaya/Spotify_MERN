import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

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
        user: formatUserResponse(user),
      },
    });
  } catch (error) {
    if (
      error.code === 11000 &&
      error.keyPattern?.email
    ) {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    console.error("Register user error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Terjadi kesalahan saat melakukan registrasi",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const passwordMatches =
      await user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Akun pengguna sedang dinonaktifkan",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        tokenType: "Bearer",
        expiresIn:
          process.env.JWT_EXPIRES_IN || "7d",
        user: formatUserResponse(user),
      },
    });
  } catch (error) {
    console.error("Login user error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat melakukan login",
    });
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Data pengguna berhasil diambil",
    data: {
      user: formatUserResponse(req.user),
    },
  });
};

export {
  registerUser,
  loginUser,
  getCurrentUser,
};