import {
  Navigate,
  Outlet,
} from "react-router";

import FullPageLoader from "../components/common/FullPageLoader";
import { useAuth } from "../contexts/AuthContext";

const PublicOnlyRoute = () => {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
};

export default PublicOnlyRoute;