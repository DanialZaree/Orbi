const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no two users can have the same email
    lowercase: true
  },
  password: {
    type: String,
    required: false // Not required because of Google Auth
  },
  authProvider: {
    type: String,
    required: true,
    enum: ['local', 'google'], // Only allows these two values
    default: 'local'
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple documents to have a null value
  },
  displayName: {
    type: String
  },
  profilePicture: {
    type: String
  }
}, {
  // Automatically adds createdAt and updatedAt fields
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);