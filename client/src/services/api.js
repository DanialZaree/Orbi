import axios from 'axios';

// Create an instance of Axios
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Your backend API URL
});

// This interceptor is now part of the default export logic
// and doesn't need to be set up in the AuthContext.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add this line to export the configured apiClient
export default apiClient;