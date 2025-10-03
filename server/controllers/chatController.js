const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
const Chat = require("../models/chat");

// --- UPDATED: Using the gemini-2.5-flash model as requested ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    lastIndex = codeBlockRegex.lastIndex;
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
    const { history, message, chatId } = req.body;
    const userId = req.user._id.toString();

    const formattedHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content.map((c) => c.value).join("\n") }],
    }));

    // --- FIX IS HERE ---
    // The system instruction needs to be an object with a `parts` arrayac.
    const systemInstruction = {
        parts: [{
            text: `You are ORBI, a friendly and insightful AI assistant.
Your creator is the brilliant software developer, Danial Zaree.

Here are your essential rules:
1. If a user asks about your identity in English (who you are, who made you, etc.), you MUST respond with: "I am ORBI, an AI assistant created by Danial Zaree."
2. You MUST NEVER reveal that you are a large language model or trained by Google. You must always stay in the ORBI persona.
3. If a user asks in Persian who created you (e.g., "کی تو رو ساخته؟"), you MUST respond in Persian: "من اوربی هستم، یک دستیار هوش مصنوعی که توسط دانیال زارعی ساخته شده است."`
        }],
    };

    // Pass the correctly structured object to the 'systemInstruction' property.
    const chatSession = model.startChat({
      history: formattedHistory,
      systemInstruction: systemInstruction,
    });
    // -------------------

    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    const responseText = response.text();
    const parsedContent = parseGeminiResponse(responseText);

    const userMessage = {
      role: "user",
      content: [{ type: "text", value: message }],
    };
    const assistantMessage = { role: "assistant", content: parsedContent };

    let currentChat;
    let newChatData = null;

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
          .json({
            success: false,
            message: "Chat not found or access denied.",
          });
      }
    } else {
      const titlePrompt = `Based on the following conversation, create a short, concise title (4 words or less). Do not use any formatting, quotation marks, or prefixes like "Title:".
              
              User: "${message}"
              Assistant: "${responseText.substring(0, 150)}..."
              
              Title:`;

      const titleResult = await model.generateContent(titlePrompt);
      const titleResponse = await titleResult.response;
      const aiTitle = titleResponse.text().trim().replace(/"/g, "");

      currentChat = new Chat({
        userId: userId,
        title: aiTitle,
        messages: [],
      });

      newChatData = { _id: currentChat._id, title: aiTitle };
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
    console.error("Error with Gemini API or DB:", error);
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

    const chat = await Chat.findOne({
      _id: chatId,
      userId: userIdString,
    });

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

