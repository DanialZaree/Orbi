const { Resend } = require("resend");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const resend = new Resend(process.env.RESEND_API_KEY);
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage",
);

// Helpers
const formatUser = (user) => ({
  id: user._id,
  name: user.displayName,
  email: user.email,
  picture: user.profilePicture,
});

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });

// --- Google Login Handler ---
exports.googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Authorization code is missing." });
    }
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    const user = await User.findOneAndUpdate(
      { googleId },
      {
        $set: {
          email,
          displayName: name,
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
    console.error("Google authentication failed:", error.message);
    res
      .status(401)
      .json({ success: false, message: "Google authentication failed." });
  }
};

// --- Get Current User Profile ---
exports.getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: formatUser(req.user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// --- Email/Password OTP Registration (Step 1) ---
exports.requestEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid email." });
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
          isVerified: false,
        },
        $setOnInsert: {
          displayName: normalizedEmail.split("@")[0],
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );

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

    res.status(200).json({ success: true, message: "Verification OTP sent to your email." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Server error sending OTP." });
  }
};

// --- Email/Password OTP Verification & Registration (Step 2) ---
exports.verifyEmailAndRegister = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    if (!email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and OTP are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: normalizedEmail,
      otpExpires: { $gt: Date.now() },
    });

    if (!user || !user.otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP or code has expired." });
    }

    const isOtpMatch = await bcrypt.compare(otp.trim(), user.otp);
    if (!isOtpMatch) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
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
    console.error("Error during verification:", error);
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
};

// --- Email/Password Login for Existing Users ---
exports.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email and password.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
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
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
};
