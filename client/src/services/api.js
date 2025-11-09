import axios from "axios";

// --- THIS IS THE FIX ---
// Use Vite's environment variable to set the base URL
// import.meta.env.PROD is `true` when in production (on Vercel)
// It's `false` when in development (running `npm run dev`)
const baseURL = import.meta.env.PROD
  ? "/api" // Use this for Vercel
  : "http://localhost:5000/api"; // Use this for local development

const apiClient = axios.create({
  baseURL: baseURL,
});
// --- END OF FIX ---


// This interceptor (your "FIX Part 1") is correct and
// should be kept. It runs before every request.
apiClient.interceptors.request.use(
  (config) => {
    // Read the token from LocalStorage on every request
    const token = localStorage.getItem("authToken"); // Make sure this key matches what you use on login
    if (token) {
      // If the token exists, add it to the header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;