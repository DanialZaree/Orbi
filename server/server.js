require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const securityHeaders = require("./middleware/securityHeaders");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.disable("x-powered-by");
app.set("trust proxy", 1);

// --- MIDDLEWARE ---
app.use(securityHeaders);

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
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "15mb" }));

// --- DATABASE CONNECTION ---
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("FATAL ERROR: MONGO_URI is not defined.");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("Successfully connected to MongoDB! ✅"))
  .catch((err) => console.error("Failed to connect to MongoDB. ❌", err));

// --- API ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, _next) => {
  console.error("Unhandled Server Error:", err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// --- START THE SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
