const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// --- Nodemailer configuration for Gmail ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// --- Google OAuth Client ---
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage',
);

// --- Google Login Handler ---
exports.googleLogin = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, message: "Authorization code is missing." });
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
                email, 
                displayName: name,
                profilePicture: picture,
                authProvider: 'google',
                isVerified: true // Google accounts are considered verified
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const appToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ 
            success: true, 
            token: appToken, 
            user: {
                id: user._id,
                name: user.displayName,
                email: user.email,
                picture: user.profilePicture,
            }
        });
    } catch (error) {
        console.error("!!! GOOGLE AUTHENTICATION FAILED !!!", error.message);
        res.status(401).json({ success: false, message: "Google authentication failed." });
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
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};


// --- Email/Password OTP Registration (Step 1) ---
exports.requestEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email.' });
        }

        let user = await User.findOne({ email });
        if (user && user.isVerified) {
            return res.status(400).json({ success: false, message: 'A user with this email already exists. Please log in.' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 12);
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        if (user) {
            user.otp = hashedOtp;
            user.otpExpires = otpExpires;
            await user.save();
        } else {
            const displayName = email.split('@')[0];
            user = new User({
                email,
                displayName,
                otp: hashedOtp,
                otpExpires,
                authProvider: 'local'
            });
            await user.save();
        }

        await transporter.sendMail({
            from: `"Orbi" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Your Orbi Verification Code',
            text: `Your verification code is: ${otp}`,
            html: `<b>Your verification code is: ${otp}</b><p>This code will expire in 10 minutes.</p>`,
        });

        res.status(200).json({ success: true, message: 'Verification OTP sent to your email.' });
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
            return res.status(400).json({ success: false, message: 'Email, password, and OTP are required.' });
        }

        const user = await User.findOne({ email, otpExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid OTP or it has expired.' });
        }

        const isOtpMatch = await bcrypt.compare(otp, user.otp);
        if (!isOtpMatch) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }

        user.password = await bcrypt.hash(password, 12);
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const appToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            success: true,
            token: appToken,
            user: {
                id: user._id,
                name: user.displayName,
                email: user.email,
                picture: user.profilePicture,
            }
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
            return res.status(400).json({ success: false, message: "Please provide email and password." });
        }

        const user = await User.findOne({ email, authProvider: 'local' });
        if (!user || !user.isVerified) {
            return res.status(401).json({ success: false, message: "Invalid credentials or email not verified." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }
        
        const appToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            token: appToken,
            user: {
                id: user._id,
                name: user.displayName,
                email: user.email,
                picture: user.profilePicture,
            }
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
};

