import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUserRequest,
  loginRequest,
  registerRequest,
} from "../services/auth.service";

import { TOKEN_KEY } from "../services/api";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [isLoading, setIsLoading] =
    useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);

    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response =
        await loginRequest(credentials);

      const loginToken =
        response.data?.token;

      const loginUser =
        response.data?.user;

      if (!loginToken || !loginUser) {
        throw new Error(
          "Respons login dari server tidak lengkap"
        );
      }

      localStorage.setItem(
        TOKEN_KEY,
        loginToken
      );

      setToken(loginToken);
      setUser(loginUser);

      return response;
    },
    []
  );

  const register = useCallback(
    async (registrationData) => {
      return registerRequest(
        registrationData
      );
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }

        return;
      }

      try {
        const response =
          await getCurrentUserRequest();

        if (isMounted) {
          setUser(response.data.user);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);

        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated:
        Boolean(user && token),
      login,
      register,
      logout,
    }),
    [
      user,
      token,
      isLoading,
      login,
      register,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth harus digunakan di dalam AuthProvider"
    );
  }

  return context;
};

export {
  AuthProvider,
  useAuth,
};