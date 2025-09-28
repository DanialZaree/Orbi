const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

// When a POST request is made to '/google', it calls the googleLogin function
router.post('/google', authLimiter, authController.googleLogin);

module.exports = router;