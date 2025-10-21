const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() { return this.authProvider === 'local'; }
  },
  authProvider: {
    type: String,
    required: true,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true 
  },
  displayName: {
    type: String
  },
  profilePicture: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

