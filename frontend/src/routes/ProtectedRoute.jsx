import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router";

import FullPageLoader from "../components/common/FullPageLoader";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = () => {
  const location = useLocation();

  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;