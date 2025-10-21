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

  const handleAuthSuccess = (token, userData) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setAuthToken(token);
    setUser(userData);
    window.location.href = "/"; // Refresh on successful auth
  };

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
        handleAuthSuccess(response.data.token, response.data.user);
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

  // --- ADDED: Functions for the OTP and local auth flow ---
  const emailLogin = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.success) {
        handleAuthSuccess(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const requestOTP = async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register-otp', { email });
      return response.data; 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndRegister = async (email, password, otp) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register-verify', { email, password, otp });
      if (response.data.success) {
        handleAuthSuccess(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };


  const value = { authToken, user, isLoading, error, login, logout, emailLogin, requestOTP, verifyAndRegister };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

