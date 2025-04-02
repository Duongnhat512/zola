const bcrypt = require('bcrypt');
const UserModel = require('../models/user.model');
const BlackList = require('../models/blacklist.model');
const { use } = require('express/lib/router');
const authMethod = require('../methods/auth.method');
const randToken  = require('rand-token');
const jwtVariable = require('../../variables/jwt');
const e = require('express');

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
    const username = req.body.username.toLowerCase();
    const user = await UserModel.getUser(username);
    if (user) {
        return res.status(409).send({ message: 'Tài khoản đã tồn tại' });
    } else {
        const hashPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
        const newUser = {
            username: username,
            password: hashPassword,
            // fullname: req.body.fullname,
            // dob: req.body.dob,
            // gender: req.body.gender,
            // avt: req.body.avt,
        };
        const createUser = await UserModel.createUser(newUser);
        if (!createUser) {
            return res
                .status(400)
                .send({ message: 'Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại.' });
        }
        return res.send({
            username
        });
    }
};


exports.login = async (req, res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;

    const user = await UserModel.getUser(username);
    if (!user) {
        return res.status(404).send({ message: 'Tài khoản không tồn tại' });
    }
    const isMatch = bcrypt.compareSync(req.body.password, user.password);
    if (!isMatch) {
        return res.status(401).send({ message: 'Sai mật khẩu' });
    }

    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const dateForAccessToken = {
        username: user.username,
    };
    const accessToken = await authMethod.generateToken(
        dateForAccessToken,
        accessTokenSecret,
        accessTokenLife,
    )
    if (!accessToken) {
        return res
            .status(401)
            .send('Đăng nhập không thành công, vui lòng thử lại.');
    }

    let refreshToken = randToken.generate(jwtVariable.refreshTokenSize); // tạo 1 refresh token ngẫu nhiên
    if (!user.refreshToken) {
        // Nếu user này chưa có refresh token thì lưu refresh token đó vào database
        await UserModel.updateRefreshToken(user.username, refreshToken);
    } else {
        // Nếu user này đã có refresh token thì lấy refresh token đó từ database
        refreshToken = user.refreshToken;
    }

    return res.json({
		msg: 'Đăng nhập thành công.',
		accessToken,
		refreshToken,
		user,
	});
};

exports.refreshToken = async (req, res) => {
	// Lấy access token từ header
	const accessTokenFromHeader = req.headers.authorization?.split(' ')[1];
	if (!accessTokenFromHeader) {
		return res.status(400).send('Không tìm thấy access token.');
	}

	// Lấy refresh token từ body
	const refreshTokenFromBody = req.body.refreshToken;
	if (!refreshTokenFromBody) {
		return res.status(400).send('Không tìm thấy refresh token.');
	}

	const accessTokenSecret =
		process.env.ACCESS_TOKEN_SECRET;
	const accessTokenLife =
		process.env.ACCESS_TOKEN_LIFE;

	// Decode access token đó
	const decoded = await authMethod.decodeToken(
		accessTokenFromHeader,
		accessTokenSecret,
	);
	if (!decoded) {
		return res.status(400).send('Access token không hợp lệ.');
	}

	const username = decoded.payload.username; // Lấy username từ payload

	const user = await UserModel.getUser(username);
	if (!user) {
		return res.status(401).send('User không tồn tại.');
	}

	if (refreshTokenFromBody !== user.refreshToken) {
		return res.status(400).send('Refresh token không hợp lệ.');
	}

	// Tạo access token mới
	const dataForAccessToken = {
		username,
	};

	const accessToken = await authMethod.generateToken(
		dataForAccessToken,
		accessTokenSecret,
		accessTokenLife,
	);
	if (!accessToken) {
		return res
			.status(400)
			.send('Tạo access token không thành công, vui lòng thử lại.');
	}
	return res.json({
		accessToken,
	});
};

exports.logout = async (req, res) => {
    const { username } = req.body;
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
        return res.status(400).send({ message: 'Access token không hợp lệ' });
    }

    const user = await UserModel.getUser(username);
    if (!user) {
        return res.status(403).send({ message: 'Không tồn tại tài khoản' });
    }

    await BlackList.create(accessToken);
    console.log('Blacklist: ', accessToken);

    await UserModel.updateRefreshToken(user.username, null);

    return res.send({ message: 'Đăng xuất thành công' });
}
