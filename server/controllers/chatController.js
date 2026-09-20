const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
const Chat = require("../models/chat");
const {
  MAX_HISTORY_MESSAGES,
  dataUriToGenerativePart,
  processFilePart,
  parseGeminiResponse,
} = require("../utils/chatHelpers");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
  },
});

const SYSTEM_INSTRUCTION = {
  parts: [
    {
      text: `You are Orbi, an expert, professional full-stack AI coding assistant and problem solver created by Danial Zaree.

Instructions:
1. Markdown Formatting: Always format your responses using clean, structured GitHub Flavored Markdown (proper headings, lists, tables, and bold highlights).
2. Code Blocks: Format every code snippet or file in its own fenced code block with the appropriate language identifier (e.g., \`\`\`tsx, \`\`\`typescript, \`\`\`javascript, \`\`\`bash, \`\`\`html, \`\`\`css, \`\`\`json).
3. Coherent Flow: Present explanations and files in a clean, logical sequence. Never repeat introductory text, greetings, or overview sections between files or steps. Provide concise, high-value explanations.
4. Creator Identity:
   - If asked "who made you", "who built you", or similar in English, state that you were created by Danial Zaree (https://github.com/DanialZaree).
   - If asked in Persian (e.g., "کی تو رو ساخته؟", "سازنده تو کیه؟"), respond with "دانیال زارعی" (https://github.com/DanialZaree).`,
    },
  ],
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.sendMessage = async (req, res) => {
  try {
    const { message = "", chatId, images = [], videos = [], documents = [], skipUserSave } = req.body;
    const userId = req.user._id.toString();

    if (!message.trim() && !images.length && !videos.length && !documents.length) {
      return res.status(400).json({ success: false, message: "Cannot send an empty message." });
    }

    let currentChat = null;
    let formattedHistory = [];

    if (chatId) {
      if (!isValidId(chatId)) {
        return res.status(400).json({ success: false, message: "Invalid chat ID format." });
      }
      currentChat = await Chat.findOne({ _id: chatId, userId });
      if (!currentChat) {
        return res.status(404).json({ success: false, message: "Chat not found." });
      }

      const historyToProcess = currentChat.messages.slice(-MAX_HISTORY_MESSAGES);
      formattedHistory = historyToProcess
        .map((msg) => {
          if (msg.role === "assistant") {
            const assistantText = (msg.content || [])
              .map((block) => {
                if (block.type === "code") {
                  return `\`\`\`${block.language || ""}\n${block.value}\n\`\`\``;
                }
                return block.value || "";
              })
              .filter(Boolean)
              .join("\n\n");

            if (!assistantText) return null;
            return {
              role: "model",
              parts: [{ text: assistantText }],
            };
          }

          const mediaParts = (msg.content || [])
            .map((block) => {
              if (block.type === "image" || block.type === "video") {
                return dataUriToGenerativePart(block.value);
              }
              if (block.type === "file") {
                return processFilePart(block.value, block.fileName);
              }
              return null;
            })
            .filter(Boolean);

          const userText = (msg.content || [])
            .filter((block) => block.type === "text" && block.value?.trim())
            .map((block) => block.value.trim())
            .join("\n\n");

          const userParts = [
            ...mediaParts,
            ...(userText ? [{ text: userText }] : []),
          ];

          if (userParts.length === 0) return null;
          return {
            role: "user",
            parts: userParts,
          };
        })
        .filter(Boolean);
    }

    // Convert media to Gemini generative parts
    const mediaParts = [
      ...images.map(dataUriToGenerativePart),
      ...videos.map(dataUriToGenerativePart),
      ...documents.map((doc) => processFilePart(doc.value, doc.name)),
    ].filter(Boolean);

    const userMessageParts = [
      ...mediaParts,
      ...(message.trim() ? [{ text: message }] : []),
    ];

    const contents = [
      ...formattedHistory,
      { role: "user", parts: userMessageParts },
    ];

    // Call Gemini API with timeout protection
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI_TIMEOUT")), 45000)
    );

    const geminiPromise = model.generateContent({
      contents,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const result = await Promise.race([geminiPromise, timeoutPromise]);
    const response = await result.response;
    const responseText = response.text();
    const parsedContent = parseGeminiResponse(responseText);

    // Build user content array without redundant base64 duplication
    const userMessageContent = [
      ...images.map((dataUri) => ({
        type: dataUri.startsWith("data:video/") ? "video" : "image",
        value: dataUri,
      })),
      ...videos.map((dataUri) => ({
        type: dataUri.startsWith("data:image/") ? "image" : "video",
        value: dataUri,
      })),
      ...documents.map((doc) => ({
        type: "file",
        value: doc.value,
        fileName: doc.name,
      })),
      ...(message.trim() ? [{ type: "text", value: message }] : []),
    ];

    const userMessage = { role: "user", content: userMessageContent };
    const assistantMessage = { role: "assistant", content: parsedContent };

    let newChatData = null;

    if (!currentChat) {
      const firstText = message.trim();
      const generatedTitle = firstText
        ? (firstText.length > 50 ? `${firstText.slice(0, 50)}...` : firstText)
        : "New Chat";

      currentChat = new Chat({
        userId,
        title: generatedTitle,
        messages: [],
      });
      newChatData = { _id: currentChat._id, title: currentChat.title };
    }

    if (skipUserSave) {
      currentChat.messages.push(assistantMessage);
    } else {
      currentChat.messages.push(userMessage, assistantMessage);
    }

    await currentChat.save();

    res.status(200).json({
      success: true,
      response: parsedContent,
      chatId: currentChat._id,
      newChat: newChatData,
    });
  } catch (error) {
    console.error("Error communicating with AI or DB:", error);
    if (error.message === "AI_TIMEOUT") {
      return res.status(504).json({
        success: false,
        message: "The AI service timed out. Please try again with a shorter prompt.",
      });
    }
    if (error.status === 429 || error.message?.includes("ResourceExhausted") || error.message?.includes("429")) {
      return res.status(429).json({
        success: false,
        message: "AI rate limit reached. Please wait a moment before trying again.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Error communicating with the AI.",
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select("_id title")
      .lean();

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch chat history." });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const userId = req.user._id.toString();

    if (!isValidId(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid chat ID format." });
    }

    const chat = await Chat.findOne({ _id: chatId, userId }).lean();
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found or access denied." });
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error("Error fetching single chat:", error);
    res.status(500).json({ success: false, message: "Failed to fetch chat." });
  }
};

exports.renameChatById = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const { newTitle } = req.body;
    const userId = req.user._id.toString();

    if (!newTitle || !newTitle.trim()) {
      return res.status(400).json({ success: false, message: "New title cannot be empty." });
    }
    if (!isValidId(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid chat ID format." });
    }

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { $set: { title: newTitle.trim() } },
      { new: true }
    ).select("_id title").lean();

    if (!updatedChat) {
      return res.status(404).json({ success: false, message: "Chat not found or permission denied." });
    }

    res.status(200).json({
      success: true,
      message: "Chat renamed successfully.",
      chat: updatedChat,
    });
  } catch (error) {
    console.error("Error renaming chat:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.deleteChatById = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const userId = req.user._id.toString();

    if (!isValidId(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid chat ID format." });
    }

    const result = await Chat.findOneAndDelete({ _id: chatId, userId });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or you do not have permission to delete it.",
      });
    }

    res.status(200).json({ success: true, message: "Chat deleted successfully." });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.deleteLastMessage = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const userId = req.user._id.toString();

    if (!isValidId(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid chat ID format." });
    }

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found or access denied." });
    }

    if (!chat.messages || chat.messages.length === 0) {
      return res.status(400).json({ success: false, message: "No messages to delete." });
    }

    chat.messages.pop();
    await chat.save();

    res.status(200).json({ success: true, message: "Last message deleted successfully." });
  } catch (error) {
    console.error("Error deleting last message:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
