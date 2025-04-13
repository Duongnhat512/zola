const FriendModel = require("../models/friend.model");
const FriendController = {};

FriendController.findUserByPhoneNumber = async (req, res) => {
  const { phoneNumber } = req.query;

  if (!phoneNumber) {
    return res
      .status(400)
      .json({ code: 400, message: "Số điện thoại không hợp lệ" });
  }
  try {
    const user = await FriendModel.findUserByPhoneNumber(phoneNumber);
    if (!user) {
      return res
        .status(404)
        .json({ code: 404, message: "Số điện thoại không hợp lệ" });
    }
    return res.status(200).json({ code: 200, user });
  } catch (error) {
    console.error("Có lỗi khi tìm kiếm người dùng:", error);
    return res
      .status(500)
      .json({ code: 500, message: "Có lỗi khi tìm kiếm người dùng" });
  }
};

module.exports = FriendController;
