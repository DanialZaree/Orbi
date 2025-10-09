const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Or wherever your controller is
const authMiddleware = require('../middleware/authMiddleware'); // A middleware to verify JWT

// Existing Google login route
router.post('/google', authController.googleLogin);

const rateLimit = require('express-rate-limit');

// Rate limiting middleware for protected routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// NEW: Protected route to get user profile (with rate limiting)
router.get('/me', apiLimiter, authMiddleware, authController.getMe);

module.exports = router;