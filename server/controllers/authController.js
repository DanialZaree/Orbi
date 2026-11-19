const { Resend } = require("resend");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { isValidEmail } = require("../utils/validators");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage",
);

const MAX_OTP_ATTEMPTS = 5;

// Helpers
const formatUser = (user) => ({
  id: user._id,
  name: user.displayName || user.email?.split("@")[0] || "User",
  email: user.email,
  picture: user.profilePicture || null,
});

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured on the server.");
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

// --- Google Login Handler ---
exports.googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Valid authorization code is required." });
    }

    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Google token payload." });
    }

    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOneAndUpdate(
      { googleId },
      {
        $set: {
          email: normalizedEmail,
          displayName: name || normalizedEmail.split("@")[0],
          profilePicture: picture,
          authProvider: "google",
          isVerified: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const token = createToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Google authentication failed:", error.message || error);
    res
      .status(401)
      .json({ success: false, message: "Google authentication failed. Please try again." });
  }
};

// --- Get Current User Profile ---
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated." });
    }
    res.status(200).json({
      success: true,
      user: formatUser(req.user),
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// --- Email/Password OTP Registration (Step 1) ---
exports.requestEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid email address." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (existingUser.authProvider === "google") {
        return res.status(400).json({
          success: false,
          message: "This email is registered with Google. Please sign in with Google.",
        });
      }
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "A user with this email already exists. Please log in.",
        });
      }

      // Email cooldown rate check: prevent spamming OTP within 60 seconds
      if (existingUser.otpExpires && existingUser.otpExpires > Date.now() + 9 * 60 * 1000) {
        return res.status(429).json({
          success: false,
          message: "A code was recently sent. Please wait 60 seconds before requesting another code.",
        });
      }
    }

    const otp = crypto.randomInt(1000, 9999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          authProvider: "local",
          otp: hashedOtp,
          otpExpires,
          otpAttempts: 0,
          isVerified: false,
        },
        $setOnInsert: {
          displayName: normalizedEmail.split("@")[0],
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );

    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || '"Orbi" <support@orbiai.ir>',
        to: normalizedEmail,
        subject: "Your Orbi Verification Code",
        text: `Your Orbi verification code is ${otp}. This code will expire in 10 minutes.`,
        html: `
          <div style="font-family:sans-serif;max-width:420px;margin:auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
            <h2 style="color:#111827;text-align:center;">Verify your email</h2>
            <p style="color:#6b7280;text-align:center;">Your one-time verification code for Orbi is:</p>
            <div style="text-align:center;font-size:32px;letter-spacing:6px;font-weight:bold;padding:16px;background:#f9fafb;border-radius:8px;margin:24px 0;">
              ${otp}
            </div>
            <p style="color:#9ca3af;font-size:12px;text-align:center;">Expires in 10 minutes. If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } else {
      console.warn("RESEND_API_KEY not configured. OTP generated for development:", otp);
    }

    res.status(200).json({ success: true, message: "Verification OTP sent to your email." });
  } catch (error) {
    console.error("Error sending OTP:", error.message || error);
    res.status(500).json({ success: false, message: "Server error sending OTP." });
  }
};

// --- Email/Password OTP Verification & Registration (Step 2) ---
exports.verifyEmailAndRegister = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string" ||
      !otp ||
      typeof otp !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and OTP are required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 128 characters long.",
      });
    }

    const cleanOtp = otp.trim();
    if (!/^\d{4}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: "Verification code must be 4 digits.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: normalizedEmail,
      otpExpires: { $gt: Date.now() },
    });

    if (!user || !user.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or code has expired.",
      });
    }

    // Brute-force protection: check attempt limit
    if ((user.otpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
      await User.findByIdAndUpdate(user._id, {
        $unset: { otp: 1, otpExpires: 1, otpAttempts: 1 },
      });
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new verification code.",
      });
    }

    const isOtpMatch = await bcrypt.compare(cleanOtp, user.otp);
    if (!isOtpMatch) {
      await User.findByIdAndUpdate(user._id, {
        $inc: { otpAttempts: 1 },
      });
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          password: hashedPassword,
          isVerified: true,
        },
        $unset: {
          otp: 1,
          otpExpires: 1,
          otpAttempts: 1,
        },
      },
      { new: true },
    );

    const token = createToken(updatedUser._id);

    res.status(201).json({
      success: true,
      token,
      user: formatUser(updatedUser),
    });
  } catch (error) {
    console.error("Error during verification:", error.message || error);
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
};

// --- Email/Password Login for Existing Users ---
exports.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email and password.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail, authProvider: "local" });

    if (!user || !user.isVerified || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or account not verified.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = createToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Error during login:", error.message || error);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
};
