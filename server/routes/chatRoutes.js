const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// This route handles fetching the user's chat list
router.get('/', authMiddleware, chatController.getChatHistory);

// This route handles sending a new message
router.post('/', authMiddleware, chatController.sendMessage);

// ... any other routes ...

module.exports = router;