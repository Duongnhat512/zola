const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const authController = require('../controllers/auth.controller');
const { isAuth } = require('../middlewares/auth.middlewares');
const qrSessions = new Map();
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', isAuth, authController.logout);
router.post('/change-password', isAuth, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);
router.post('/send-otp', authController.sendOTP);
router.post('/decode-token', authController.decodeToken);
router.post("/qr-session", (req, res) => {
    try {
        const sessionId = uuidv4();
        qrSessions.set(sessionId, { status: "pending", user: null });
        res.json({ sessionId });
    } catch (error) {
        console.error("Error creating QR session:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Mobile xác thực QR
router.post("/qr-login", (req, res) => {
    const { sessionId, token } = req.body;
    if (!qrSessions.has(sessionId)) return res.status(400).json({ message: "Invalid session" });
    qrSessions.set(sessionId, { status: "authenticated", token });
    res.json({ success: true });
});
// // Mobile xác thực QR
// router.post("/qr-login", (req, res) => {
//     const { sessionId, token } = req.body;
//     // TODO: verify token, lấy user info từ token
//     if (!qrSessions.has(sessionId)) return res.status(400).json({ message: "Invalid session" });
//     // Giả sử đã verify token, lấy user info
//     const user = { id: "userIdFromToken", username: "usernameFromToken" }; // Thay bằng decode token thực tế
//     qrSessions.set(sessionId, { status: "authenticated", user });
//     res.json({ success: true });
// });
// Web polling kiểm tra trạng thái
router.get("/qr-session/:sessionId", (req, res) => {
    const session = qrSessions.get(req.params.sessionId);
    if (!session) return res.status(404).json({ message: "Not found" });
    res.json(session);
});
module.exports = router;