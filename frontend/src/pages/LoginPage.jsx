import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router";
import useAuth from "../hooks/useAuth";

function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    setSubmitting(true);

    try {
      await login(form);

      navigate(location.state?.from || "/", {
        replace: true,
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
          <p className="eyebrow">
            Selamat datang kembali
          </p>

          <h1>Masuk ke akun Anda</h1>

          <p>
            Dengarkan koleksi musik Anda dalam satu
            tempat.
          </p>
        </div>

        {location.state?.message && (
          <p className="form-message success-message">
            {location.state.message}
          </p>
        )}

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
              autoComplete="current-password"
              name="password"
              onChange={updateField}
              placeholder="Masukkan password"
              required
              type="password"
              value={form.password}
            />
          </label>

          <button
            className="primary-button"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="auth-footer">
          Belum memiliki akun?{" "}
          <Link to="/register">Daftar</Link>
        </p>

        <p className="auth-footer">
          Ingin lihat demo dulu?{" "}
          <Link to="/">Lanjut sebagai guest</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;