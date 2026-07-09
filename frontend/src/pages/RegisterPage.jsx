import { useState } from "react";
import { Link, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!PASSWORD_PATTERN.test(form.password)) {
      setError(
        "Password minimal 8 karakter dan harus memiliki huruf besar, huruf kecil, serta angka.",
      );

      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Registrasi berhasil. Silakan masuk.",
        },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" to="/">
          Soundify
        </Link>

        <div className="auth-heading">
          <p className="eyebrow">Buat akun baru</p>
          <h1>Mulai gunakan Soundify</h1>

          <p>
            Daftar untuk menyimpan favorite, membuat playlist, dan melihat
            listening history.
          </p>
        </div>

        {error && (
          <p className="form-message error-message">
            {error}
          </p>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            Nama

            <input
              autoComplete="name"
              maxLength="50"
              minLength="2"
              name="name"
              onChange={updateField}
              placeholder="Nama lengkap"
              required
              type="text"
              value={form.name}
            />
          </label>

          <label>
            Email

            <input
              autoComplete="email"
              name="email"
              onChange={updateField}
              placeholder="nama@email.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label>
            Password

            <input
              autoComplete="new-password"
              minLength="8"
              name="password"
              onChange={updateField}
              placeholder="Minimal 8 karakter"
              required
              type="password"
              value={form.password}
            />
          </label>

          <label>
            Konfirmasi password

            <input
              autoComplete="new-password"
              minLength="8"
              name="confirmPassword"
              onChange={updateField}
              placeholder="Ulangi password"
              required
              type="password"
              value={form.confirmPassword}
            />
          </label>

          <button
            className="primary-button"
            disabled={submitting}
            type="submit"
          >
            {submitting
              ? "Mendaftarkan..."
              : "Daftar"}
          </button>
        </form>

        <p className="auth-footer">
          Sudah memiliki akun?{" "}
          <Link to="/login">Masuk</Link>
        </p>

        <p className="auth-footer">
          Ingin lihat demo dulu?{" "}
          <Link to="/">Lanjut sebagai guest</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;