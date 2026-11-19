const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local" && this.isVerified === true;
      },
    },
    authProvider: {
      type: String,
      required: true,
      enum: ["local", "google"],
      default: "local",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    profilePicture: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
