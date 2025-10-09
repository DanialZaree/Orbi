const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Or wherever your controller is
const authMiddleware = require('../middleware/authMiddleware'); // A middleware to verify JWT
const rateLimit = require('express-rate-limit');

// Apply a general rate limiter to all requests in this router
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

router.use(authLimiter);

// Existing Google login route
router.post('/google', authController.googleLogin);

// Protected route to get user profile
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;