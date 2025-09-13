import { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  
  // --- ADDED STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
      if (apiClient && apiClient.defaults) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      }
    } else {
      localStorage.removeItem('authToken');
      if (apiClient && apiClient.defaults) {
        delete apiClient.defaults.headers.common['Authorization'];
      }
    }
  }, [authToken]);

  const login = async (authCode) => {
    if (!authCode) {
      console.error("Login function was called without an auth code.");
      return;
    }

    // --- UPDATE LOGIN LOGIC ---
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const response = await apiClient.post('/auth/google', { code: authCode });
      
      if (response.data.success) {
        setUser(response.data.user);
        setAuthToken(response.data.token);
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Set a user-friendly error message
      setError("Login failed. Please try again."); 
    } finally {
      setIsLoading(false); // Stop loading in both success and error cases
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
  };

  // --- EXPORT NEW VALUES ---
  const value = {
    authToken,
    user,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

