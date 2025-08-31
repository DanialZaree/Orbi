const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Define the POST route for '/'.
// 1. It first runs the authMiddleware to protect the route.
// 2. If the middleware succeeds, it then calls chatController.sendMessage.
router.post('/', authMiddleware, chatController.sendMessage);

module.exports = router;