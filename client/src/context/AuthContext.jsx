import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import apiClient from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("authToken"),
  );
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Auth Modal State ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState("signUp"); // 'signIn' | 'signUp' | 'verifyOtp'

  const openAuthModal = useCallback((initialView = "signUp") => {
    setError(null);
    setAuthModalView(initialView);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setError(null);
  }, []);

  const handleAuthSuccess = useCallback((token, userData) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setAuthToken(token);
    setUser(userData);
    setIsAuthModalOpen(false);
    setError(null);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }, []);

  // Validate session on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    apiClient
      .get("/auth/me")
      .then((response) => {
        if (isMounted && response.data?.success) {
          setUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      })
      .catch(() => {
        if (isMounted) logout();
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [logout]);

  // Intercept 401s to automatically logout
  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (err) => {
        if (err.response?.status === 401) {
          logout();
        }
        return Promise.reject(err);
      },
    );
    return () => {
      apiClient.interceptors.response.eject(interceptorId);
    };
  }, [logout]);

  const login = useCallback(async (authCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/auth/google", { code: authCode });
      if (response.data?.success) {
        handleAuthSuccess(response.data.token, response.data.user);
        return { success: true };
      }
      const msg = response.data?.message || "Google login failed.";
      setError(msg);
      return { success: false, message: msg };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  const emailLogin = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      if (response.data?.success) {
        handleAuthSuccess(response.data.token, response.data.user);
        return { success: true };
      }
      const msg = response.data?.message || "Login failed.";
      setError(msg);
      return { success: false, message: msg };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  const requestOTP = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/auth/register-otp", { email });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyAndRegister = useCallback(async (email, password, otp) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/auth/register-verify", {
        email,
        password,
        otp,
      });
      if (response.data?.success) {
        handleAuthSuccess(response.data.token, response.data.user);
        return { success: true };
      }
      const msg = response.data?.message || "Registration failed.";
      setError(msg);
      return { success: false, message: msg };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  const value = useMemo(
    () => ({
      authToken,
      user,
      isLoading,
      error,
      login,
      logout,
      emailLogin,
      requestOTP,
      verifyAndRegister,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authModalView,
      setAuthModalView,
      openAuthModal,
      closeAuthModal,
    }),
    [
      authToken,
      user,
      isLoading,
      error,
      login,
      logout,
      emailLogin,
      requestOTP,
      verifyAndRegister,
      isAuthModalOpen,
      authModalView,
      openAuthModal,
      closeAuthModal,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
