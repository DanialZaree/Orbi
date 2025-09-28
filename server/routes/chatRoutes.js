const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

// Apply rate limiter to all routes in this file
router.use(apiLimiter);

// --- THIS IS THE FIX: Add the route to get a single chat by its ID ---
// It's important to place this route before the general '/' route.
router.get('/:id', authMiddleware, chatController.getChatById);

// This route handles fetching the user's chat list
router.get('/', authMiddleware, chatController.getChatHistory);

// This route handles sending a new message
router.post('/', authMiddleware, chatController.sendMessage);

module.exports = router;

