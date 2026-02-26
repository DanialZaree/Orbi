require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const securityHeaders = require("./middleware/securityHeaders");

// Import the route modules
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const PORT = process.env.PORT ;

app.disable('x-powered-by');
app.set('trust proxy', 1);

// --- MIDDLEWARE ---
app.use(securityHeaders);

app.use(
  cors({
    origin: "https://orbi-nine.vercel.app",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

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

// --- WIRE UP API ROUTES ---
// Any request to '/api/auth' will be handled by authRoutes
app.use("/api/auth", authRoutes);

// Any request to '/api/chat' will be handled by chatRoutes
app.use("/api/chat", chatRoutes);

// --- START THE SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
