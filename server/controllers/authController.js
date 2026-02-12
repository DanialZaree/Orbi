const { Resend } = require("resend");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const resend = new Resend(process.env.RESEND_API_KEY);

// --- Google OAuth Client ---
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage",
);

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

    let user = await User.findOneAndUpdate(
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

    const appToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.status(200).json({
      success: true,
      token: appToken,
      user: {
        id: user._id,
        name: user.displayName,
        email: user.email,
        picture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("!!! GOOGLE AUTHENTICATION FAILED !!!", error.message);
    res
      .status(401)
      .json({ success: false, message: "Google authentication failed." });
  }
};

// --- Get Current User Profile ---
exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.displayName,
        email: user.email,
        picture: user.profilePicture,
      },
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

    const user = await User.findOne({ email });
    if (user && user.isVerified && user.authProvider === "local") {
      return res
        .status(400)
        .json({
          success: false,
          message: "A user with this email already exists. Please log in.",
        });
    }

    const otp = crypto.randomInt(1000, 9999).toString();
    const hashedOtp = await bcrypt.hash(otp, 12);
    const otpExpires = Date.now() + 10 * 60 * 1000;

    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          authProvider: "local",
          otp: hashedOtp,
          otpExpires: otpExpires,
          isVerified: false,
        },
        $setOnInsert: {
          displayName: email.split("@")[0],
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );

await resend.emails.send({
  from: '"Orbi" <support@orbiai.ir>',
  to: email,
  subject: "Your Orbi Verification Code",
  text: `Your Orbi verification code is ${otp}. This code will expire in 10 minutes.`,
  html: `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;background:#ffffff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.08);padding:32px;">
            
            <tr>
              <td align="center" style="padding-bottom:16px;">
                <h1 style="margin:0;font-size:22px;color:#111827;">
                  Verify your email
                </h1>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-bottom:24px;">
                <p style="margin:0;font-size:15px;color:#6b7280;">
                  Use the verification code below to sign in to <strong>Orbi</strong>.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-bottom:24px;">
                <div style="font-size:32px;letter-spacing:6px;font-weight:700;color:#111827;background:#f9fafb;padding:16px 24px;border-radius:10px;display:inline-block;">
                  ${otp}
                </div>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-bottom:24px;">
                <p style="margin:0;font-size:14px;color:#6b7280;">
                  This code will expire in <strong>10 minutes</strong>.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="border-top:1px solid #e5e7eb;padding-top:16px;">
                <p style="margin:0;font-size:12px;color:#9ca3af;">
                  If you didn’t request this, you can safely ignore this email.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `,
});


    res
      .status(200)
      .json({ success: true, message: "Verification OTP sent to your email." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error sending OTP." });
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
      return res
        .status(400)
        .json({
          success: false,
          message: "A valid email, password, and OTP are required.",
        });
    }

    let user = await User.findOne({ email, otpExpires: { $gt: Date.now() } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or it has expired." });
    }

    const isOtpMatch = await bcrypt.compare(otp, user.otp);
    if (!isOtpMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user = await User.findByIdAndUpdate(
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

    const appToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.status(201).json({
      success: true,
      token: appToken,
      user: {
        id: user._id,
        name: user.displayName,
        email: user.email,
        picture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error during verification:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during registration." });
  }
};

// --- Email/Password Login for Existing Users ---
exports.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide a valid email and password.",
        });
    }

    const user = await User.findOne({ email, authProvider: "local" });
    if (!user || !user.isVerified) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Invalid credentials or email not verified.",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }
    const appToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.status(200).json({
      success: true,
      token: appToken,
      user: {
        id: user._id,
        name: user.displayName,
        email: user.email,
        picture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login." });
    ;
  }
};
