import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// --- THIS IS THE FIX (Part 1) ---
// This interceptor runs before every request.
apiClient.interceptors.request.use(
  (config) => {
    // Read the token from localStorage on every request
    const token = localStorage.getItem('authToken');
    if (token) {
      // If the token exists, add it to the header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

