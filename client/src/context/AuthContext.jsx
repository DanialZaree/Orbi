import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/api'; // Your Axios instance

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Component
export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null); // Optional: store user details

  // Set the token in localStorage and apiClient defaults
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('authToken');
      delete apiClient.defaults.headers.common['Authorization'];
    }
    setAuthToken(token);
  };

  const login = async (credential) => {
    try {
      const response = await apiClient.post('/auth/google', { credential });
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user); // Optionally save user data
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    authToken,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Create a custom hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}