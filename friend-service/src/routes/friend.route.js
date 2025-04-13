const express = require("express");
const router = express.Router();
const FriendController = require("../controllers/friend.controller");
const { isAuthExpress } = require("../middlewares/auth.middleware");

// Tìm người dùng theo số điện thoại
router.get("/find", isAuthExpress, FriendController.findUserByPhoneNumber);

// Gửi lời mời kết bạn
router.post("/request", FriendController.createFriendRequest);

// Chấp nhận lời mời kết bạn
router.put("/accept", isAuthExpress, FriendController.acceptFriendRequest);

// Từ chối lời mời kết bạn
router.put("/reject", isAuthExpress, FriendController.rejectFriendRequest);

// Lấy danh sách lời mời kết bạn
router.get(
  "/requests/:userId",
  isAuthExpress,
  FriendController.getFriendRequests
);

module.exports = router;
