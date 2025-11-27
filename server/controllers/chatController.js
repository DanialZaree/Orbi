const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
const Chat = require("../models/chat");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper to convert Base64 data URI to a Gemini Part object
function dataUriToGenerativePart(dataUri) {
  try {
    const match = dataUri.match(
      /^data:([a-zA-Z0-9\/+]+);base64,([a-zA-Z0-9+/=]+)$/,
    );
    if (!match) {
      throw new Error("Invalid data URI format");
    }
    return { inlineData: { data: match[2], mimeType: match[1] } };
  } catch (error) {
    console.error("Failed to parse data URI:", error.message);
    return null; // Return null to be filtered out
  }
}

// Helper to parse the AI's text response
function parseGeminiResponse(responseText) {
  const contentArray = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  while ((match = codeBlockRegex.exec(responseText)) !== null) {
    if (match.index > lastIndex) {
      const textBlock = responseText.substring(lastIndex, match.index).trim();
      if (textBlock) contentArray.push({ type: "text", value: textBlock });
    }
    const codeBlock = match[2].trim();
    if (codeBlock)
      contentArray.push({
        type: "code",
        language: match[1] || "plaintext",
        value: codeBlock,
      });
  }
  if (lastIndex < responseText.length) {
    const finalTextBlock = responseText.substring(lastIndex).trim();
    if (finalTextBlock)
      contentArray.push({ type: "text", value: finalTextBlock });
  }
  return contentArray;
}

exports.sendMessage = async (req, res) => {
  try {
    const { message, chatId, images, videos } = req.body;
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
      // Re-format database history for Gemini, including any past images/videos
      formattedHistory = currentChat.messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: msg.content
          .map((block) => {
            if (block.type === "image" || block.type === "video") {
              return dataUriToGenerativePart(block.value);
            }
            return { text: block.value };
          })
          .filter((part) => part), // Filter out any null/invalid parts
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

    // Place image and video parts *before* the text part for the API call
    const userMessageParts = [
      ...newImageParts,
      ...newVideoParts,
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

    // Save to DB with images and videos *before* text
    const userMessage = {
      role: "user",
      content: [
        // Place the images first
        ...(images || []).map((dataUri) => {
          const type = dataUri.startsWith("data:video/") ? "video" : "image";
          return { type, value: dataUri };
        }),
        // Place the videos next
        ...(videos || []).map((dataUri) => {
          const type = dataUri.startsWith("data:image/") ? "image" : "video";
          return { type, value: dataUri };
        }),
        // Place the text last
        { type: "text", value: message },
      ],
    };
    const assistantMessage = { role: "assistant", content: parsedContent };

    let newChatData = null;
    if (!currentChat) {
    // ... (title generation logic remains the same) ...
    }

    currentChat.messages.push(userMessage, assistantMessage);
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
      { new: true },
    );
    if (!updatedChat) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Chat not found or permission denied.",
        });
    }
    res
      .status(200)
      .json({
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
      return res
        .status(404)
        .json({
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
