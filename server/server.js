require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import Google AI SDK
const { OAuth2Client } = require('google-auth-library'); // Import Google Auth Library

// Import your models
const User = require('./models/user');
const Chat = require('./models/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// --- DATABASE CONNECTION ---
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error('FATAL ERROR: MONGO_URI is not defined.');
  process.exit(1);
}
mongoose.connect(mongoURI)
  .then(() => console.log('Successfully connected to MongoDB! ✅'))
  .catch((err) => console.error('Failed to connect to MongoDB. ❌', err));

// --- GOOGLE AUTH SETUP ---
const googleClientId = process.env.GOOGLE_CLIENT_ID;
if (!googleClientId) {
    console.error('FATAL ERROR: GOOGLE_CLIENT_ID is not defined.');
    process.exit(1);
}
const client = new OAuth2Client(googleClientId);


// --- GEMINI API SETUP ---
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not defined.');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// --- UTILITY FUNCTION TO PARSE GEMINI RESPONSE ---
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

// --- API ROUTES ---

// --- Google Auth Route ---
app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential } = req.body; // The ID token from the frontend
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: googleClientId,
        });
        const payload = ticket.getPayload();

        const { sub: googleId, email, name: displayName, picture: profilePicture } = payload;

        // Upsert user logic: Find user or create if they don't exist
        let user = await User.findOne({ googleId });

        if (!user) {
            user = new User({
                googleId,
                email,
                displayName,
                profilePicture,
                authProvider: 'google',
            });
            await user.save();
        }

        // TODO: Generate a JWT for the user and send it back for session management
        res.status(200).json({ success: true, user });

    } catch (error) {
        console.error("Error with Google authentication:", error);
        res.status(401).json({ success: false, message: "Google authentication failed." });
    }
});


// This is the main route for handling chat messages
app.post('/api/chat', async (req, res) => {
  try {
    const { history, message } = req.body;

    // Format history for the Gemini API
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content.map(c => c.value).join('\n') }] // Combine content blocks for history
    }));

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const responseText = response.text();

    // Parse the response to handle text and code blocks
    const parsedContent = parseGeminiResponse(responseText);

    // TODO: Save the user's message and the assistant's parsedContent to your database here

    res.json({ success: true, response: parsedContent });

  } catch (error) {
    console.error("Error with Gemini API:", error);
    res.status(500).json({ success: false, message: "Error communicating with the AI." });
  }
});

// --- START THE SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
