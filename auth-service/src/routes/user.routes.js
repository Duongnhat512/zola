const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/auth.middlewares');
const { UserController } = require('../controllers/user.controller');

router.get('/profile', isAuth, async (req, res) => {
    res.send({ user: req.user });
});
router.post('/update', isAuth, UserController.updateUser);
router.post('/update-avt', isAuth, UserController.updateAvt);

module.exports = router;