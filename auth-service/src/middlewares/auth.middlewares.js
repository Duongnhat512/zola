const UserModel = require('../models/user.model');

const authMethod = require('../methods/auth.method');

exports.isAuth = async (req, res, next) => {
    const accessTokenFromHeader = req.headers.x_authorization;
    if (!accessTokenFromHeader) {
        return res.status(401).send('Không tìm thấy access token.');
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const verified = await authMethod.verifyToken(
        accessTokenFromHeader,
        accessTokenSecret
    )

    if (!verified) {
        return res.status(401).send('Access token không hợp lệ.');
    }

    const user = await UserModel.getUser(verified.payload.username);
    req.user = user;

    return next();
};