const bcrypt = require("bcrypt");
const UserModel = require("../models/user.model");
const BlackList = require("../models/blacklist.model");
const authMethod = require("../methods/auth.method");
const randToken = require("rand-token");
const jwtVariable = require("../../variables/jwt");
const vonageMethod = require("../methods/vonage.method");
const otpMethod = require("../methods/otp.method");
const jwt = require('jsonwebtoken');
const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
    const username = req.body.username;
    const user = await UserModel.getUser(username);
    if (user) {
        return res.status(409).send({ message: 'Tài khoản đã tồn tại' });
    } else {
        const hashPassword = bcrypt.hashSync(req.body.password, SALT_ROUNDS);
        const newUser = {
            username: username,
            phone: req.body.phone,
            password: hashPassword,
            fullname: req.body.fullname,
            dob: req.body.dob,
            gender: req.body.gender,
            status: req.body.status,
        };
        const createUser = await UserModel.createUser(newUser);
        if (!createUser) {
            return res
                .status(400)
                .send({ message: 'Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại.' });
        }
        return res.json({
            status: 'success',
            message: 'Tạo tài khoản thành công',
            username
        });
    }
};

exports.login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = await UserModel.getUser(username);
    if (!user) {
        return res.status(404).send({ message: "Tài khoản không tồn tại" });
    }
    const isMatch = bcrypt.compareSync(req.body.password, user.password);
    if (!isMatch) {
        return res.status(401).send({ message: "Sai mật khẩu" });
    }

    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const dataForAccessToken = {
        username: user.username,
    };
    const accessToken = await authMethod.generateToken(
        dataForAccessToken,
        accessTokenSecret,
        accessTokenLife
    );
    if (!accessToken) {
        return res
            .status(401)
            .send("Đăng nhập không thành công, vui lòng thử lại.");
    }

    let refreshToken = randToken.generate(jwtVariable.refreshTokenSize); // tạo 1 refresh token ngẫu nhiên
    if (!user.refreshToken) {
        // Nếu user này chưa có refresh token thì lưu refresh token đó vào database
        await UserModel.updateRefreshToken(user.id, refreshToken);
    } else {
        // Nếu user này đã có refresh token thì lấy refresh token đó từ database
        refreshToken = user.refreshToken;
    }

    return res.json({
        status: "success",
        message: "Đăng nhập thành công.",
        accessToken,
        refreshToken,
        user,
    });
};

exports.refreshToken = async (req, res) => {
    const refreshTokenFromBody = req.body.refresh_token;
    const accessTokenFromHeader = req.headers.authorization?.split(" ")[1];
    const username = req.body.username;

    if (!refreshTokenFromBody) {
        return res.status(400).send('Không tìm thấy refresh token.');
    }

    if (!username) {
        return res.status(400).send('Không tìm thấy username.');
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;

    // Kiểm tra user và refresh token
    const user = await UserModel.getUser(username);
    if (!user) {
        return res.status(401).send('User không tồn tại.');
    }

    if (refreshTokenFromBody !== user.refresh_token) {
        return res.status(400).send('Refresh token không hợp lệ.');
    }

    // Kiểm tra access token có hợp lệ không
    if (accessTokenFromHeader) {
        const isBlacklisted = await BlackList.find(accessTokenFromHeader);
        if (isBlacklisted) {
            return res.status(401).send('Access token đã hết hạn.');
        }
        const verified = await authMethod.verifyToken(
            accessTokenFromHeader,
            accessTokenSecret
        );
        if (!verified) {
            return res.status(400).send('Access token đã hết hạn.');
        }
    }

    await BlackList.create(accessTokenFromHeader);

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
        status: 'success',
        message: 'Cấp lại access token thành công.',
        accessToken,
    });
};

exports.logout = async (req, res) => {
    const { username } = req.body;
    const accessToken = req.headers.authorization?.split(" ")[1];

    await BlackList.create(accessToken);

    const user = await UserModel.getUser(username);
    if (!user) {
        return res.status(403).send({ message: "Không tồn tại tài khoản" });
    }

    await UserModel.updateRefreshToken(user.id, null);

    return res.json({ status: "success", message: "Đăng xuất thành công" });
};

exports.sendOTP = async (req, res) => {
    const username = req.body.username;

    const otp = otpMethod.generateOTP();

    // await vonageMethod.sendOTP(username, otp);
    try {
        await vonageMethod.sendOTP(username, otp);
    } catch (error) {
        console.error("Gửi mã OTP không thành công:", error);
        return res
            .status(500)
            .send({
                message: "Có lỗi trong quá trình gửi mã OTP, vui lòng thử lại.",
            });
    }

    return res.json({
        status: "success",
        message: "Mã OTP đã được gửi đến số điện thoại của bạn.",
        username,
        otp,
    });
};

exports.verifyOTP = async (req, res) => {
    const username = req.body.username;
    const otp = req.body.otp;

    const user = await UserModel.getUser(username);
    if (!user) {
        return res.status(404).send({ message: "Tài khoản không tồn tại" });
    }
    if (user.otp !== otp) {
        return res.status(401).send({ message: "Mã OTP không hợp lệ" });
    }

    const currentTime = new Date().getTime();

    if (user.otp_expiry_time < currentTime) {
        return res.status(401).send({ message: "Mã OTP đã hết hạn" });
    }

    return res.json({
        status: 200,
        message: "Xác thực thành công",
        username,
    });
};

exports.changePassword = async (req, res) => {
    const username = req.user.username.toLowerCase();
    const password = req.body.password;
    const newPassword = req.body.newPassword;

    const user = await UserModel.getUser(username);
    if (!user) {
        return res.status(404).send({ message: "Tài khoản không tồn tại" });
    }
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return res.status(401).send({ message: "Sai mật khẩu" });
    }

    const hashPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);
    await UserModel.updatePassword(user.id, hashPassword);

    return res.json({
        status: 200,
        message: "Đổi mật khẩu thành công",
        username,
    });
};

exports.forgotPassword = async (req, res) => {
    const username = req.body.username;
    const user = await UserModel.getUser(username);
    if (!user) {
        return res.status(404).send({ message: "Tài khoản không tồn tại" });
    }
    const otp = otpMethod.generateOTP(); // Tạo mã OTP ngẫu nhiên 6 chữ số
    const expiryTime = new Date().getTime() + 2 * 60 * 1000; // Thời gian hết hạn là 2 phút sau

    await UserModel.updateOTP(user.id, otp, expiryTime); // Cập nhật mã OTP và thời gian hết hạn vào database

    try {
        await vonageMethod.sendOTP(username, otp); // Gửi mã OTP đến số điện thoại của người dùng
    } catch (error) {
        console.error("Gửi mã OTP không thành công:", error);
        return res
            .status(500)
            .send({
                message: "Có lỗi trong quá trình gửi mã OTP, vui lòng thử lại.",
            });
    }

    return res.json({
        status: "success",
        message: "Mã OTP đã được gửi đến số điện thoại của bạn.",
        username,
    });
};

exports.resetPassword = async (req, res) => {
    const username = req.body.username;
    const newPassword = req.body.newPassword;
    const otp = req.body.otp;

    const user = await UserModel.getUser(username);
    if (!user) {
        return res.status(404).send({ message: "Tài khoản không tồn tại" });
    }
    if (user.otp !== otp) {
        return res.status(401).send({ message: "Mã OTP không hợp lệ" });
    }

    const hashPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);

    await UserModel.updatePassword(user.id, hashPassword);
    await UserModel.updateOTP(user.id, null, null); // Xóa mã OTP sau khi xác thực thành công

    return res.json({
        status: "success",
        message: "Đặt lại mật khẩu thành công",
        username,
    });
};

exports.decodeToken = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Lấy token từ header Authorization
        if (!token) {
            return res.status(400).json({ message: "Token không được cung cấp." });
        }

        // Giải mã token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const username = decoded.payload.username; // Lấy username từ payload

        const user = await UserModel.getUser(username);
        console.log("user: ", user);

        return res.json({
            status: "success",
            message: "Giải mã token thành công.",
            user: user, // Thông tin user từ token
        });
    } catch (error) {
        console.error("Error decoding token:", error);
        return res.status(401).json({ message: "Token không hợp lệ." });
    }
};