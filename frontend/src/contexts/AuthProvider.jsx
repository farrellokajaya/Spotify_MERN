import { useEffect, useMemo, useState } from "react";
import AuthContext from "./AuthContext";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/api";

const TOKEN_KEY = "soundify_token";

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let ignore = false;

    getCurrentUser(token)
      .then((response) => {
        if (!ignore) {
          setUser(response.data.user);
        }
      })
      .catch(() => {
        if (!ignore) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    const nextToken = response.data.token;

    localStorage.setItem(TOKEN_KEY, nextToken);

    setToken(nextToken);
    setUser(response.data.user);
    setLoading(false);

    return response.data.user;
  };

  const register = async (payload) => {
    return registerUser(payload);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);

    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
    }),
    [user, token, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;