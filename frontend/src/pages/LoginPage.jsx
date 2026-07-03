import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router";

import AuthLayout from "../components/layout/AuthLayout";
import { useAuth } from "../contexts/AuthContext";
import getApiError from "../utils/apiError";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const successMessage =
    location.state?.successMessage;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(form);

      const destination =
        location.state?.from?.pathname || "/";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      const apiError = getApiError(
        error,
        "Login gagal"
      );

      setErrorMessage(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Selamat datang kembali"
      description="Login untuk melanjutkan ke akun Soundify."
      footerText="Belum memiliki akun?"
      footerLinkText="Daftar"
      footerLinkTo="/register"
    >
      {successMessage && (
        <div
          className="alert alert-success"
          role="status"
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          className="alert alert-error"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="nama@email.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Password
          </label>

          <div className="password-field">
            <input
              id="password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
            >
              {showPassword
                ? "Sembunyikan"
                : "Lihat"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Memproses..."
            : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;