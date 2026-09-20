const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

router.use(authLimiter);

// Google OAuth
router.post("/google", authController.googleLogin);

// Email & Password (Local)
router.post("/login", authController.loginWithEmail);
router.post("/register-otp", authController.requestEmailOTP);
router.post("/register-verify", authController.verifyEmailAndRegister);

// Protected route to get current user's profile
router.get("/me", authMiddleware, authController.getCurrentUser);

module.exports = router;
