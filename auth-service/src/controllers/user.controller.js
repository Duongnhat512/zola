const e = require('express');
const { s3, dynamoDB } = require('../config/aws-helper');
const { UserModel } = require('../models/user.model');

const UserController = {}

UserController.updateUser = async (req, res) => {
    const username = req.params.username.toLowerCase();
    const { fullname, dob, gender } = req.body;

    const data = await UserModel.updateUser(username, { fullname, dob, gender });
    if (!data) {
        return res.status(400).send({ message: 'Có lỗi trong quá trình cập nhật thông tin, vui lòng thử lại.' });
    }

    return res.send({
        fullname: fullname,
        dob: dob,
        gender: gender
    })
}


UserController.updateAvt = async (req, res) => {
    const username = req.params.username.toLowerCase();
    const file = req.file;
    const avt = await s3.uploadFile(file);

    if (!avt) {
        return res.status(400).send({ message: 'Có lỗi trong quá trình cập nhật ảnh đại diện, vui lòng thử lại.' });
    }

    const data = await UserModel.updateAvt(username, avt);

    return res.send({
        avt: avt
    });
}

exports.UserController = UserController;