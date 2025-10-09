import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../services/api'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(() => {
    const token = localStorage.getItem('authToken');
    console.log("AuthContext: Initial authToken from localStorage:", token); // <-- ADD THIS LOG
    return token;
  });
  const [user, setUser] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch user profile when needed
  const fetchUserProfile = useCallback(async (token) => {
    if (!token) {
      setUser(null);
      console.log("AuthContext: fetchUserProfile called with no token."); // <-- ADD THIS LOG
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log("AuthContext: Attempting to fetch profile with token:", token); // <-- ADD THIS LOG
      const response = await apiClient.get('/auth/profile', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("AuthContext: Fetched user profile success:", response.data.user); // <-- ADD THIS LOG
      setUser(response.data.user); 
    } catch (err) {
      console.error("AuthContext: Failed to fetch user profile:", err.message, err.response?.status); // <-- MODIFIED LOG
      setError("Failed to load user profile. Please log in again.");
      setUser(null); 
      setAuthToken(null); 
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  }, []); 

  // Effect to manage authToken in localStorage and API client headers
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('authToken', authToken);
      if (apiClient && apiClient.defaults) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        console.log("AuthContext: apiClient Authorization header set:", apiClient.defaults.headers.common['Authorization']); // <-- ADD THIS LOG
      }
      if (!user) { 
        console.log("AuthContext: authToken exists, user is null. Calling fetchUserProfile."); // <-- ADD THIS LOG
        fetchUserProfile(authToken); 
      }
    } else {
      localStorage.removeItem('authToken');
      if (apiClient && apiClient.defaults) {
        delete apiClient.defaults.headers.common['Authorization'];
        console.log("AuthContext: apiClient Authorization header cleared."); // <-- ADD THIS LOG
      }
      setUser(null); 
      console.log("AuthContext: authToken is null. User set to null."); // <-- ADD THIS LOG
    }
  }, [authToken, user, fetchUserProfile]); 

  const login = async (authCode) => {
    // ... (existing login logic)
    try {
      const response = await apiClient.post('/auth/google', { code: authCode });
      console.log("AuthContext: Google login response from backend:", response.data); // <-- ADD THIS LOG
      if (response.data.success) {
        setUser(response.data.user); 
        setAuthToken(response.data.token);
        console.log("AuthContext: Login successful, authToken and user set."); // <-- ADD THIS LOG
      } else {
        setError(response.data.message || "Google login failed.");
      }
    } catch (err) {
      console.error("AuthContext: Login failed:", err);
      setError(err.response?.data?.message || "Login failed. Please try again."); 
      setUser(null);
      setAuthToken(null);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken'); 
    console.log("AuthContext: User logged out."); // <-- ADD THIS LOG
  };

  const value = { authToken, user, isLoading, error, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}