const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
const Chat = require("../models/chat");
const {
  dataUriToGenerativePart,
  processFilePart,
  parseGeminiResponse,
} = require("../utils/chatUtils");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.sendMessage = async (req, res) => {
  try {
    // 1. Destructure skipUserSave from the request
    const { message, chatId, images, videos, documents, skipUserSave } =
      req.body;
    const userId = req.user._id.toString();

    let formattedHistory = [];
    let currentChat;

    if (chatId) {
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid chat ID format." });
      }
      currentChat = await Chat.findOne({ _id: chatId, userId: userId });
      if (!currentChat) {
        return res
          .status(404)
          .json({ success: false, message: "Chat not found." });
      }
      // Re-format database history for Gemini
      formattedHistory = currentChat.messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: msg.content
          .map((block) => {
            if (block.type === "image" || block.type === "video") {
              return dataUriToGenerativePart(block.value);
            } else if (block.type === "file") {
              return processFilePart(block.value, block.fileName);
            }
            return { text: block.value };
          })
          .filter((part) => part),
      }));
    }

    const systemInstruction = {
      // ... (your system instruction remains the same) ...
    };

    const newImageParts = (images || [])
      .map(dataUriToGenerativePart)
      .filter((part) => part);

    const newVideoParts = (videos || [])
      .map(dataUriToGenerativePart)
      .filter((part) => part);

    const newDocumentParts = (documents || [])
      .map((doc) => processFilePart(doc.value, doc.name))
      .filter((part) => part);

    // Place image, video, and document parts *before* the text part for the API call
    const userMessageParts = [
      ...newImageParts,
      ...newVideoParts,
      ...newDocumentParts,
      { text: message },
    ];

    const contents = [
      ...formattedHistory,
      { role: "user", parts: userMessageParts },
    ];

    const result = await model.generateContent({
      contents: contents,
      systemInstruction: systemInstruction,
    });

    const response = await result.response;
    const responseText = response.text();
    const parsedContent = parseGeminiResponse(responseText);

    // Prepare the User Message object
    const userMessage = {
      role: "user",
      content: [
        ...(images || []).map((dataUri) => {
          const type = dataUri.startsWith("data:video/") ? "video" : "image";
          return { type, value: dataUri };
        }),
        ...(videos || []).map((dataUri) => {
          const type = dataUri.startsWith("data:image/") ? "image" : "video";
          return { type, value: dataUri };
        }),
        ...(documents || []).map((doc) => {
          return { type: "file", value: doc.value, fileName: doc.name };
        }),
        { type: "text", value: message },
      ],
    };

    // Prepare the Assistant Message object
    const assistantMessage = { role: "assistant", content: parsedContent };

    let newChatData = null;

    // Handle New Chat Creation
    if (!currentChat) {

      const firstText = (message || "").trim();
      let generatedTitle = firstText ? firstText.slice(0, 50) : "New Chat";
      if (firstText.length > 50) generatedTitle += "...";

      currentChat = new Chat({
        userId: userId,
        title: generatedTitle,
        messages: [],
      });
      newChatData = { _id: currentChat._id, title: currentChat.title };
    }

    if (skipUserSave && currentChat) {
      currentChat.messages.push(assistantMessage);
    } else {
      currentChat.messages.push(userMessage, assistantMessage);
    }

    await currentChat.save();

    res.json({
      success: true,
      response: parsedContent,
      chatId: currentChat._id,
      newChat: newChatData,
    });
  } catch (error) {
    console.error("Error with Gemini API or DB:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Error communicating with the AI." });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userIdString = req.user._id.toString();
    const chats = await Chat.find({ userId: userIdString })
      .sort({ updatedAt: -1 })
      .select("_id title");
    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch chat history." });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const userIdString = req.user._id.toString();
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid chat ID format." });
    }
    const chat = await Chat.findOne({ _id: chatId, userId: userIdString });
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found or access denied." });
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
    if (!newTitle || newTitle.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "New title cannot be empty." });
    }
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid chat ID format." });
    }
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId, userId: userId },
      { $set: { title: newTitle } },
      { new: true }
    );
    if (!updatedChat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or permission denied.",
      });
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
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid chat ID format." });
    }
    const result = await Chat.findOneAndDelete({
      _id: chatId,
      userId: userId,
    });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or you do not have permission to delete it.",
      });
    }
    res
      .status(200)
      .json({ success: true, message: "Chat deleted successfully." });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
exports.deleteLastMessage = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const userId = req.user._id.toString();

    // 1. Validate ID format
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid chat ID format." });
    }

    // 2. Find the chat
    const chat = await Chat.findOne({ _id: chatId, userId: userId });

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found or access denied." });
    }

    // 3. Remove the last message
    if (chat.messages && chat.messages.length > 0) {
      chat.messages.pop(); // Remove the last item from the array
      await chat.save(); // Save the update to MongoDB

      return res
        .status(200)
        .json({ success: true, message: "Last message deleted successfully." });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No messages to delete." });
    }
  } catch (error) {
    console.error("Error deleting last message:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
