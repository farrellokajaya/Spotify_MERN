import { Navigate } from "react-router";
import useAuth from "../../hooks/useAuth";

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <main className="center-screen">
        <p className="muted-text">Memeriksa sesi...</p>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default GuestRoute;