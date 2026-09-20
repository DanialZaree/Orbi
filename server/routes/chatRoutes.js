const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");
const { apiLimiter } = require("../middleware/rateLimiter");

// Apply rate limiter and authentication to all chat endpoints
router.use(apiLimiter);
router.use(authMiddleware);

// Chat collection routes
router.get("/", chatController.getChatHistory);
router.post("/", chatController.sendMessage);

// Message-level sub-routes (must precede generic /:id)
router.delete("/:id/last", chatController.deleteLastMessage);
router.patch("/:id/rename", chatController.renameChatById);

// Single chat resource routes
router.get("/:id", chatController.getChatById);
router.delete("/:id", chatController.deleteChatById);

module.exports = router;