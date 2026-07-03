import { Link } from "react-router";

const AuthLayout = ({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}) => {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <Link
            to="/"
            className="brand-logo"
          >
            <span className="brand-logo-icon">
              S
            </span>

            <span>Soundify</span>
          </Link>

          <div className="auth-brand-copy">
            <p className="eyebrow">
              MUSIC FOR EVERY MOMENT
            </p>

            <h1>
              Dengarkan musik yang membuat
              harimu lebih berarti.
            </h1>

            <p>
              Temukan musik, susun playlist,
              dan nikmati pengalaman mendengarkan
              bersama Soundify.
            </p>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          {children}

          <p className="auth-footer">
            {footerText}{" "}
            <Link to={footerLinkTo}>
              {footerLinkText}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;