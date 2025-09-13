const mongoose = require('mongoose');

// A sub-schema for a single block of content (text, code, or image)
const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['text', 'code', 'image']
  },
  value: {
    type: String,
    required: true
  },
  language: { 
    type: String,
    required: false
  }
}, { _id: false });


// The schema for a single message in a chat
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: [contentBlockSchema],
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });


// The main chat schema with the userId type corrected
const chatSchema = new mongoose.Schema({
  userId: {
    // --- FIX: Changed type from ObjectId to String to match existing database data ---
    type: String,
    ref: 'User',
    required: true,
    index: true 
  },
  title: {
    type: String,
    required: true
  },
  messages: [messageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
