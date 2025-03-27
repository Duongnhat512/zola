const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { isAuth } = require('../middlewares/auth.middlewares');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', isAuth, authController.logout);

module.exports = router;