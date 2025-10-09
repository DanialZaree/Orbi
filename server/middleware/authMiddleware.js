// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("BACKEND AuthMiddleware: Received Authorization header:", authHeader); // <-- ADD THIS LOG

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log("BACKEND AuthMiddleware: No token or invalid format. Sending 401."); // <-- ADD THIS LOG
            return res.status(401).json({ success: false, message: 'Authentication token required.' });
        }

        const token = authHeader.split(' ')[1];
        console.log("BACKEND AuthMiddleware: Extracted token:", token); // <-- ADD THIS LOG
        // console.log("BACKEND AuthMiddleware: JWT_SECRET used for verification:", process.env.JWT_SECRET); // <-- TEMPORARY: Use for debugging secret mismatch

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("BACKEND AuthMiddleware: Token successfully decoded:", decoded); // <-- ADD THIS LOG
        
        req.user = await User.findById(decoded.userId).select('-password');
        
        if (!req.user) {
            console.log("BACKEND AuthMiddleware: User not found for ID:", decoded.userId); // <-- ADD THIS LOG
            return res.status(401).json({ success: false, message: 'User not found.' });
        }

        console.log("BACKEND AuthMiddleware: User authenticated successfully:", req.user.email); // <-- ADD THIS LOG
        next(); 

    } catch (error) {
        console.error("BACKEND AuthMiddleware: Token verification failed or other error:", error.message); // <-- MODIFIED LOG
        // console.error("BACKEND AuthMiddleware: Error details:", error); // <-- TEMPORARY: For more verbose error
        res.status(401).json({ success: false, message: 'Invalid or expired token.' }); 
    }
};

module.exports = authMiddleware;