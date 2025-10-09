const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Or wherever your controller is
const authMiddleware = require('../middleware/authMiddleware'); // A middleware to verify JWT

// Existing Google login route
router.post('/google', authController.googleLogin);

// NEW: Protected route to get user profile
router.get('/profile', authMiddleware, authController.getProfile); // <-- Add this line
                                          // `authMiddleware` would verify the JWT and attach user.id to req

module.exports = router;