const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/chat');

// Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Utility function (can be moved to a separate utils file later)
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

exports.sendMessage = async (req, res) => {
    try {
        const { history, message, chatId } = req.body;
        const userId = req.user._id; // Get user ID from our auth middleware

        // 1. Prepare messages for Gemini API
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content.map(c => c.value).join('\n') }]
        }));

        const chatSession = model.startChat({ history: formattedHistory });
        const result = await chatSession.sendMessage(message);
        const response = await result.response;
        const responseText = response.text();
        const parsedContent = parseGeminiResponse(responseText);
        
        // 2. Prepare messages for our database
        const userMessage = { role: 'user', content: [{ type: 'text', value: message }] };
        const assistantMessage = { role: 'assistant', content: parsedContent };

        let currentChat;
        // 3. Find existing chat or create a new one
        if (chatId) {
            currentChat = await Chat.findOne({ _id: chatId, userId: userId });
            if (!currentChat) {
                return res.status(404).json({ success: false, message: 'Chat not found or access denied.' });
            }
        } else {
            currentChat = new Chat({
                userId: userId,
                title: message.substring(0, 30), // Use first 30 chars as title
                messages: []
            });
        }
        
        // 4. Save messages to the database
        currentChat.messages.push(userMessage, assistantMessage);
        await currentChat.save();

        res.json({ 
            success: true, 
            response: parsedContent,
            chatId: currentChat._id // Send back the chatId
        });

    } catch (error) {
        console.error("Error with Gemini API or DB:", error);
        res.status(500).json({ success: false, message: "Error communicating with the AI." });
    }
};