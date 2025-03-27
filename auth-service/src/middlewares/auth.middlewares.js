const UserModel = require('../models/user.model');
const authMethod = require('../methods/auth.method');
const BlackList = require('../models/blacklist.model');

exports.isAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access token không tồn tại.');
    }

    const isBlacklisted = await BlackList.find(token);
    if (isBlacklisted) {
        return res.status(401).send('Access token đã hết hạn.');
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const verified = await authMethod.verifyToken(
        token,
        accessTokenSecret
    )

    if (!verified) {
        return res.status(401).send('Access token không hợp lệ.');
    }

    const user = await UserModel.getUser(verified.payload.username);
    req.user = user;

    return next();
};