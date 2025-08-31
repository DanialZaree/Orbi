const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name: displayName, picture: profilePicture } = payload;

        // Find user or create if they don't exist
        let user = await User.findOneAndUpdate(
            { googleId },
            { 
                email, 
                displayName, 
                profilePicture, 
                authProvider: 'google' 
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // **Create JWT Token**
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15d' } // Token will be valid for 15 days
        );

        res.status(200).json({ 
            success: true, 
            token, // Send the token to the client
            user: {
                id: user._id,
                displayName: user.displayName,
                profilePicture: user.profilePicture,
            }
        });

    } catch (error) {
        console.error("Error with Google authentication:", error);
        res.status(401).json({ success: false, message: "Google authentication failed." });
    }
};