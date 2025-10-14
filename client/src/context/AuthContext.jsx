import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import apiClient from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("authToken")
  );
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      apiClient
        .get("/auth/me")
        .then((response) => {
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      apiClient.interceptors.response.eject(interceptorId);
    };
  }, [logout]);

  const login = async (authCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/auth/google", { code: authCode });
      if (response.data.success) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.href = "/";
      } else {
        setError(response.data.message || "Google login failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const value = { authToken, user, isLoading, error, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
