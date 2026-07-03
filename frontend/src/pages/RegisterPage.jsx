import { useState } from "react";
import {
  useNavigate,
} from "react-router";

import AuthLayout from "../components/layout/AuthLayout";
import { useAuth } from "../contexts/AuthContext";
import getApiError from "../utils/apiError";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] =
    useState(initialForm);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [validationErrors, setValidationErrors] =
    useState([]);

  const [showPassword, setShowPassword] =
    useState(false);

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
    setValidationErrors([]);

    if (
      form.password !==
      form.confirmPassword
    ) {
      setErrorMessage(
        "Konfirmasi password tidak sama"
      );

      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          successMessage:
            "Registrasi berhasil. Silakan login menggunakan akun baru.",
        },
      });
    } catch (error) {
      const apiError = getApiError(
        error,
        "Registrasi gagal"
      );

      setErrorMessage(apiError.message);
      setValidationErrors(
        apiError.errors
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Buat akun Soundify"
      description="Daftar untuk mulai menikmati musik favoritmu."
      footerText="Sudah memiliki akun?"
      footerLinkText="Login"
      footerLinkTo="/login"
    >
      {errorMessage && (
        <div
          className="alert alert-error"
          role="alert"
        >
          <p>{errorMessage}</p>

          {validationErrors.length > 0 && (
            <ul>
              {validationErrors.map(
                (error, index) => (
                  <li
                    key={`${error.field}-${index}`}
                  >
                    {error.message}
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      )}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label htmlFor="name">
            Nama lengkap
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Farrel Lokajaya"
            autoComplete="name"
            minLength={2}
            maxLength={50}
            required
          />
        </div>

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
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              minLength={8}
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

          <p className="field-hint">
            Gunakan huruf besar, huruf kecil,
            dan angka.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">
            Konfirmasi password
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Ulangi password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Mendaftarkan..."
            : "Daftar"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;