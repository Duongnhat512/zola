const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { isAuth } = require('../middlewares/auth.middlewares');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', isAuth, authController.logout);
router.post('/change-password', isAuth, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router;