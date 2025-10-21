const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication requests from this IP, please try again after 15 minutes',
});

router.use(authLimiter);


// Google OAuth
router.post('/google', authController.googleLogin);

// Email & Password (Local)
router.post('/login', authController.loginWithEmail);
router.post('/register-otp', authController.requestEmailOTP);
router.post('/register-verify', authController.verifyEmailAndRegister);

// Protected route to get current user's profile
router.get('/me', authMiddleware, authController.getCurrentUser);


module.exports = router;

