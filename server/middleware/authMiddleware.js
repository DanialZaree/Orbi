const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token required." });
    }

    const token = authHeader.split(" ")[1]?.trim();
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token required." });
    }

    if (!process.env.JWT_SECRET) {
      console.error("FATAL: JWT_SECRET environment variable is missing.");
      return res.status(500).json({ success: false, message: "Internal server error." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload." });
    }

    const user = await User.findById(decoded.userId)
      .select("_id email displayName profilePicture authProvider isVerified")
      .lean();

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found or session revoked." });
    }

    req.user = user;
    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
