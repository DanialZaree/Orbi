const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/chat');
const mongoose = require('mongoose'); // Import mongoose

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

function parseGeminiResponse(responseText) {
    const contentArray = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    while ((match = codeBlockRegex.exec(responseText)) !== null) {
        if (match.index > lastIndex) {
            contentArray.push({ type: 'text', value: responseText.substring(lastIndex, match.index).trim() });
        }
        contentArray.push({ type: 'code', language: match[1] || 'plaintext', value: match[2].trim() });
        lastIndex = codeBlockRegex.lastIndex;
    }
    if (lastIndex < responseText.length) {
        contentArray.push({ type: 'text', value: responseText.substring(lastIndex).trim() });
    }
    return contentArray.filter(block => block.value);
}

// --- Make sure this function is exported ---
exports.sendMessage = async (req, res) => {
    try {
        const { history, message, chatId } = req.body;
        // This is correct: It ensures any NEW chats are saved with a proper ObjectId
        const userId = new mongoose.Types.ObjectId(req.user._id);

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
            // Also update this query to be flexible
            const userIdString = req.user._id.toString();
            currentChat = await Chat.findOne({ 
                _id: chatId, 
                $or: [{ userId: userId }, { userId: userIdString }] 
            });
            if (!currentChat) {
                return res.status(404).json({ success: false, message: 'Chat not found or access denied.' });
            }
        } else {
            currentChat = new Chat({
                userId: userId,
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

// --- Make sure this function is exported ---
exports.getChatHistory = async (req, res) => {
    try {
        const userIdObject = req.user._id;
        const userIdString = req.user._id.toString();

        console.log("--- Fetching Chat History ---");
        console.log("Querying for ObjectId:", userIdObject);
        console.log("Querying for String:", userIdString);

        // --- FINAL FIX: Use $or to find chats where userId is either a String or an ObjectId ---
        const chats = await Chat.find({
            $or: [
                { userId: userIdObject },
                { userId: userIdString }
            ]
        })
            .sort({ updatedAt: -1 })
            .select('_id title');

        console.log("Database found", chats.length, "chats for this user.");
        if (chats.length > 0) {
            console.log("Found chats:", chats);
        }
        console.log("--------------------------");

        res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ success: false, message: "Failed to fetch chat history." });
    }
};

// --- Make sure this function is exported ---
exports.getChatById = async (req, res) => {
    try {
        const { id: chatId } = req.params;
        const userIdObject = req.user._id;
        const userIdString = req.user._id.toString();

        // --- FINAL FIX: Use $or here as well for consistency ---
        const chat = await Chat.findOne({ 
            _id: chatId, 
            $or: [
                { userId: userIdObject },
                { userId: userIdString }
            ]
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

