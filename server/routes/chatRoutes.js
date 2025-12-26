const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");
const { apiLimiter } = require("../middleware/rateLimiter");

// Apply rate limiter to all routes in this file
router.use(apiLimiter);

// Get specific chat
router.get("/:id", authMiddleware, chatController.getChatById);

// Get chat history list
router.get("/", authMiddleware, chatController.getChatHistory);

// Send new message
router.post("/", authMiddleware, chatController.sendMessage);

// This deletes ONLY the last message (for regeneration)
router.delete("/:id/last", authMiddleware, chatController.deleteLastMessage);

// Delete entire chat
router.delete("/:id", authMiddleware, chatController.deleteChatById);

// Rename chat
router.patch("/:id/rename", authMiddleware, chatController.renameChatById);

module.exports = router;