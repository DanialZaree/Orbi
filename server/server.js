require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const securityHeaders = require("./middleware/securityHeaders");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Security hardening
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Apply custom security headers
app.use(securityHeaders);

// Allowed CORS origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://orbi-nine.vercel.app",
  "https://orbiai.ir",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "15mb" }));

// --- ENVIRONMENT VALIDATION ---
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "GEMINI_API_KEY"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`FATAL CONFIGURATION ERROR: Missing required environment variables: ${missingEnvVars.join(", ")}`);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

// --- DATABASE CONNECTION ---
const mongoURI = process.env.MONGO_URI;
if (mongoURI) {
  mongoose
    .connect(mongoURI)
    .then(() => console.log("Successfully connected to MongoDB! ✅"))
    .catch((err) => console.error("Failed to connect to MongoDB. ❌", err.message || err));
}

// --- API ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, _next) => {
  console.error("Unhandled Server Error:", err.message || err);
  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";
  res.status(status).json({
    success: false,
    message: isProduction && status === 500 ? "Internal Server Error" : (err.message || "Internal Server Error"),
  });
});

// --- START THE SERVER ---
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
