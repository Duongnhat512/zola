const express = require('express');
const router = express.Router();

const { isAuth } = require('../middlewares/auth.middlewares');

router.get('/profile', isAuth, async (req, res) => {
    res.send({ user: req.user });
});

module.exports = router;