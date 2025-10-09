import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../services/api'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    setUser(null);
    setAuthToken(null);
    // The useEffect for authToken will handle localStorage and apiClient headers
  }, []);

  // Add a response interceptor to handle 401 errors globally
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

  // Function to fetch user profile when needed
  const fetchUserProfile = useCallback(async (token) => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // The token is already set in the apiClient instance by the useEffect hook
      const response = await apiClient.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // Handle cases where the backend returns success: false
        logout();
      }
    } catch (err) {
      // The Axios interceptor will handle 401, but other errors might occur
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load user profile.");
      logout(); // Logout on other fetch errors as well
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // On component mount, check for a token and fetch the user profile
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      fetchUserProfile(token);
    } else {
      setIsLoading(false); // No token, stop loading
    }
  }, [fetchUserProfile]);

  // Effect to manage authToken in localStorage and API client headers
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      localStorage.removeItem('authToken');
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [authToken]);

  const login = async (authCode) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/google', { code: authCode });
      if (response.data.success) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        setError(null);
      } else {
        setError(response.data.message || "Google login failed.");
        logout();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      logout();
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