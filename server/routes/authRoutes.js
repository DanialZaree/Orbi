const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// When a POST request is made to '/google', it calls the googleLogin function
router.post('/google', authController.googleLogin);

module.exports = router;