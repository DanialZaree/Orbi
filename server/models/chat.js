const mongoose = require('mongoose');

// A sub-schema for a single block of content (text, code, or image)
const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['text', 'code', 'image'] // Defines the type of content
  },
  value: {
    type: String,
    required: true // The actual text, code, or image URL
  },
  language: { 
    type: String, // Optional: for syntax highlighting, e.g., 'javascript'
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
  // A message is now an array of these content blocks
  content: [contentBlockSchema],
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });


// The main chat schema with the performance index added
const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // <-- **This is the added line**
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