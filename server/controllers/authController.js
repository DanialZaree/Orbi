const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET, // You need to add this to your .env
    'postmessage', // Required for this flow
);

exports.googleLogin = async (req, res) => {
    try {
        // The frontend now sends an authorization 'code'
        const { code } = req.body; 

        // Exchange the code for tokens
        const { tokens } = await client.getToken(code);
        
        // Use the id_token from the response to get user details
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
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

        // Create your application's JWT Token
        const appToken = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(200).json({ 
            success: true, 
            token: appToken, 
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