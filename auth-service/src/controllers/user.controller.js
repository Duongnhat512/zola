    const e = require('express');
const { s3, dynamoDB } = require('../utils/aws.helper');
const UserModel = require('../models/user.model');

const UserController = {}

UserController.updateUser = async (req, res) => {
    const { username, fullname, dob, gender } = req.body;

    const data = await UserModel.updateUser(username, { fullname, dob, gender });
    if (!data) {
        return res.status(400).send({ message: 'Có lỗi trong quá trình cập nhật thông tin, vui lòng thử lại.' });
    }

    return res.json({
        status: 'success',
        message: 'Cập nhật thông tin thành công',
        username: username,
        fullname: fullname,
        dob: dob,
        gender: gender
    })
}


UserController.updateAvt = async (req, res) => {
    const username = req.body.username;
    const file = req.file;
    const avt = await s3.uploadFile(file);

    if (!avt) {
        return res.status(400).send({ message: 'Có lỗi trong quá trình cập nhật ảnh đại diện, vui lòng thử lại.' });
    }

    const data = await UserModel.updateAvt(username, avt);

    return res.json({
        status: 'success',
        message: 'Cập nhật ảnh đại diện thành công',
        username: username,
        avt: avt
    });
}

exports.UserController = UserController;