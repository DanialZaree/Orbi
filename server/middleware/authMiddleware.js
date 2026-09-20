const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token required." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId)
      .select("_id email displayName profilePicture authProvider")
      .lean();

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
