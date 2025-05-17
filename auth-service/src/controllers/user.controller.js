const e = require("express");
const { s3, dynamoDB } = require("../utils/aws.helper");
const UserModel = require("../models/user.model");
const { uploadFile } = require("../services/file.service");
const mime = require("mime-types");

const UserController = {};

UserController.updateUser = async (req, res) => {
  const { username, fullname, dob, gender } = req.body;

  const user = await UserModel.getUser(username);

  const data = await UserModel.updateUser(user.id, { fullname, dob, gender });
  if (!data) {
    return res.status(400).send({
      message: "Có lỗi trong quá trình cập nhật thông tin, vui lòng thử lại.",
    });
  }

  return res.json({
    status: "success",
    message: "Cập nhật thông tin thành công",
    username: username,
    fullname: fullname,
    dob: dob,
    gender: gender,
  });
};


UserController.updateAvt = async (req, res) => {
  const { username, file } = req.body;

  if (!username || !file) {
    return res.status(400).json({
      message: "Thiếu username hoặc file ảnh",
    });
  }

  try {
    // Tách phần "data:image/png;base64,..."
    const matches = file.match(/^data:(.+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: "File không hợp lệ (base64 sai định dạng)" });
    }

    const mimetype = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const extension = mime.extension(mimetype);
    const originalname = `avatar.${extension}`;

    // Tạo object giả lập file như từ multer
    const fakeFile = {
      originalname,
      buffer,
      mimetype,
    };

    // Gọi uploadFile như bạn định nghĩa
    const avt = await uploadFile(fakeFile);

    // Cập nhật database
    const user = await UserModel.getUser(username);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    await UserModel.updateAvt(user.id, avt);

    return res.json({
      status: "success",
      message: "Cập nhật ảnh đại diện thành công",
      username,
      avt,
    });
  } catch (error) {
    console.error("Lỗi cập nhật ảnh đại diện:", error);
    return res.status(500).json({ message: "Lỗi máy chủ khi cập nhật ảnh đại diện" });
  }
};


UserController.getUserById = async (req, res) => {
  const { id } = req.query;

  try {
    const data = await UserModel.getUserById(id);
    if (!data) {
      return res.status(400).send({ message: "Người dùng không tồn tại." });
    }
    return res.json({
      status: "success",
      message: "Lấy thông tin người dùng thành công",
      user: {
        username: data.username,
        fullname: data.fullname,
        dob: data.dob,
        avt: data.avt,
        gender: data.gender,
        id: data.id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Có lỗi xảy ra trong quá trình lấy thông tin người dùng.",
    });
  }
};

UserController.getUserByUsername = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).send({ message: "Thiếu username." });
  }

  try {
    const user = await UserModel.getUser(username);
    if (!user) {
      return res.status(400).send({ message: "Người dùng không tồn tại." });
    }
    return res.json({
      status: "success",
      message: "Lấy thông tin người dùng thành công",
      user: {
        id: user.id,
        phone: user.phone,
        avt: user.avt,
        fullname: user.fullname,
        dob: user.dob,
        gender: user.dob,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Có lỗi xảy ra trong quá trình lấy thông tin người dùng.",
    });
  }
};

UserController.updateUserStatus = async (req, res) => {
  const { id, status } = req.body;

  if (!id || !status) {
    return res.status(400).send({ message: "Thiếu id hoặc status." });
  }

  try {
    const data = await UserModel.updateUserStatus(id, status);
    if (!data) {
      return res.status(400).send({ message: "Người dùng không tồn tại." });
    }
    return res.json({
      status: "success",
      message: "Cập nhật trạng thái người dùng thành công",
      user: {
        id: id,
        status: status,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Có lỗi xảy ra trong quá trình cập nhật trạng thái người dùng.",
    });
  }
};

exports.UserController = UserController;
