require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import the route modules
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
// const PORT = process.env.PORT || 5000; // <- REMOVED: Vercel handles the port

// --- MIDDLEWARE ---
// This CORS rule is fine. It allows your local frontend to talk to
// your local backend. In production, requests will be same-origin
// (due to vercel.json) and won't be blocked by CORS.
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));


// --- DATABASE CONNECTION ---
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('FATAL ERROR: MONGO_URI is not defined.');
    process.exit(1);
}
mongoose.connect(mongoURI)
    .then(() => console.log('Successfully connected to MongoDB! ✅'))
    .catch((err) => console.error('Failed to connect to MongoDB. ❌', err));

// --- WIRE UP API ROUTES ---
// Any request to '/api/auth' will be handled by authRoutes
app.use('/api/auth', authRoutes);

// Any request to '/api/chat' will be handled by chatRoutes
app.use('/api/chat', chatRoutes);

// --- START THE SERVER ---
/*
REMOVED THIS BLOCK:
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
*/

// --- EXPORT THE APP FOR VERCEL ---
// This is the new line Vercel needs to run your app
// as a serverless function.
module.exports = app;