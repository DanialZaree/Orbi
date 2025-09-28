const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const Chat = require('../models/chat');

// --- UPDATED: Use the latest recommended model name ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });



// This function parses the raw text response from Gemini into structured blocks
function parseGeminiResponse(responseText) {
    const contentArray = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    while ((match = codeBlockRegex.exec(responseText)) !== null) {
        if (match.index > lastIndex) {
            const textBlock = responseText.substring(lastIndex, match.index).trim();
            if (textBlock) contentArray.push({ type: 'text', value: textBlock });
        }
        const codeBlock = match[2].trim();
        if (codeBlock) contentArray.push({ type: 'code', language: match[1] || 'plaintext', value: codeBlock });
        lastIndex = codeBlockRegex.lastIndex;
    }
    if (lastIndex < responseText.length) {
        const finalTextBlock = responseText.substring(lastIndex).trim();
        if (finalTextBlock) contentArray.push({ type: 'text', value: finalTextBlock });
    }
    return contentArray;
}

exports.sendMessage = async (req, res) => {
    try {
        const { history, message, chatId } = req.body;
        // --- FIX: Consistently use the string version of the user ID ---
        const userId = req.user._id.toString();

        const formattedHistory = history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content.map(c => c.value).join('\n') }]
        }));

        const chatSession = model.startChat({ history: formattedHistory });
        const result = await chatSession.sendMessage(message);
        const response = await result.response;
        const responseText = response.text();
        const parsedContent = parseGeminiResponse(responseText);
        
        const userMessage = { role: 'user', content: [{ type: 'text', value: message }] };
        const assistantMessage = { role: 'assistant', content: parsedContent };

        let currentChat;
        if (chatId) {
            // --- FIX: Validate the incoming chatId before using it in a query ---
            if (!mongoose.Types.ObjectId.isValid(chatId)) {
                return res.status(400).json({ success: false, message: 'Invalid chat ID format.' });
            }
            // --- FIX: Simplified query to only use the string ID ---
            currentChat = await Chat.findOne({ _id: chatId, userId: userId });
            if (!currentChat) {
                return res.status(404).json({ success: false, message: 'Chat not found or access denied.' });
            }
        } else {
            currentChat = new Chat({
                userId: userId, // Save new chats with the string ID
                title: message.substring(0, 30),
                messages: []
            });
        }
        
        currentChat.messages.push(userMessage, assistantMessage);
        await currentChat.save();

        res.json({ 
            success: true, 
            response: parsedContent,
            chatId: currentChat._id
        });

    } catch (error) {
        console.error("Error with Gemini API or DB:", error);
        res.status(500).json({ success: false, message: "Error communicating with the AI." });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const userIdString = req.user._id.toString();
        
        // --- FIX: Simplified query to only use the string ID ---
        const chats = await Chat.find({ userId: userIdString })
            .sort({ updatedAt: -1 })
            .select('_id title');
        
        res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ success: false, message: "Failed to fetch chat history." });
    }
};

exports.getChatById = async (req, res) => {
    try {
        const { id: chatId } = req.params;
        const userIdString = req.user._id.toString();

        // --- FIX: Validate the incoming chatId before using it in a query ---
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ success: false, message: 'Invalid chat ID format.' });
        }

        // --- FIX: Simplified query to only use the string ID ---
        const chat = await Chat.findOne({ 
            _id: chatId, 
            userId: userIdString 
        });

        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found or access denied." });
        }

        res.status(200).json({ success: true, chat });
    } catch (error) {
        console.error("Error fetching single chat:", error);
        res.status(500).json({ success: false, message: "Failed to fetch chat." });
    }
};

