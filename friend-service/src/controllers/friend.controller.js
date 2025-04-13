const FriendModel = require("../models/friend.model");
const { socketService } = require("../../server");

const FriendController = {
  /**
   * Tìm người dùng qua số điện thoại
   * GET /api/friends/find?phoneNumber=0123456789
   */
  findUserByPhoneNumber: async (req, res) => {
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
          .json({ code: 404, message: "Không tìm thấy người dùng" });
      }

      // Trả về thông tin người dùng (có thể lọc bớt thông tin nhạy cảm)
      return res.status(200).json({
        code: 200,
        user,
      });
    } catch (error) {
      console.error("Có lỗi khi tìm kiếm người dùng:", error);
      return res
        .status(500)
        .json({ code: 500, message: "Có lỗi khi tìm kiếm người dùng" });
    }
  },
  //   sendMessage: async (socket, data) => {
  //     data.sender_id = socket.user.id;
  //     console.log("data", data.conversation_id);
  //     try {
  //       const savedMessage = await MessageModel.sendMessage(data);
  //       socket.emit("message_sent", savedMessage);
  //       socket.to(data.conversation_id).emit("new_message", savedMessage);
  //     } catch (error) {
  //       console.error("Lỗi khi gửi tin nhắn:", error);
  //       socket.emit("error", { message: "Lỗi khi gửi tin nhắn" });
  //     }
  //   },
  /**
   * Gửi lời mời kết bạn
   * POST /api/friends/request
   * Body: { user_id, user_friend_id }
   */
  createFriendRequest: async (req, res) => {
    const { user_id, user_friend_id } = req.query;

    console.log("user_id", user_id);
    console.log("user_friend_id", user_friend_id);

    if (!user_id || !user_friend_id) {
      return res
        .status(400)
        .json({ code: 400, message: "Thiếu thông tin người dùng" });
    }

    // Kiểm tra không thể gửi lời mời kết bạn cho chính mình
    if (user_id === user_friend_id) {
      return res.status(400).json({
        code: 400,
        message: "Không thể gửi lời mời kết bạn cho chính mình",
      });
    }

    try {
      const result = await FriendModel.createFriendRequest(
        user_id,
        user_friend_id
      );

      return res.status(201).json({
        code: 201,
        message: "Đã gửi lời mời kết bạn thành công",
        data: result,
      });
    } catch (error) {
      if (error.message === "Friend request already exists") {
        return res
          .status(409)
          .json({ code: 409, message: "Đã tồn tại lời mời kết bạn" });
      }

      console.error("Có lỗi khi gửi lời mời kết bạn:", error);
      return res
        .status(500)
        .json({ code: 500, message: "Có lỗi khi gửi lời mời kết bạn" });
    }
  },

  /**
   * Chấp nhận lời mời kết bạn
   * PUT /api/friends/accept
   * Body: { user_id, user_friend_id }
   */
  acceptFriendRequest: async (req, res) => {
    const { user_id, user_friend_id } = req.query;

    if (!user_id || !user_friend_id) {
      return res
        .status(400)
        .json({ code: 400, message: "Thiếu thông tin người dùng" });
    }

    try {
      await FriendModel.acceptFriendRequest(user_id, user_friend_id);

      //   socketService.notifyFriendRequestAccepted(user_id, user_friend_id);

      return res.status(200).json({
        code: 200,
        message: "Đã chấp nhận lời mời kết bạn thành công",
      });
    } catch (error) {
      if (error.message === "Friend request not found") {
        return res
          .status(404)
          .json({ code: 404, message: "Không tìm thấy lời mời kết bạn" });
      }

      console.error("Có lỗi khi chấp nhận lời mời kết bạn:", error);
      return res
        .status(500)
        .json({ code: 500, message: "Có lỗi khi chấp nhận lời mời kết bạn" });
    }
  },

  /**
   * Từ chối lời mời kết bạn
   * PUT /api/friends/reject
   * Body: { user_id, user_friend_id }
   */
  rejectFriendRequest: async (req, res) => {
    const { user_id, user_friend_id } = req.body;

    if (!user_id || !user_friend_id) {
      return res
        .status(400)
        .json({ code: 400, message: "Thiếu thông tin người dùng" });
    }

    try {
      await FriendModel.rejectFriendRequest(user_id, user_friend_id);
      //   socketService.notifyFriendRequestRejected(user_id, user_friend_id);

      return res.status(200).json({
        code: 200,
        message: "Đã từ chối lời mời kết bạn thành công",
      });
    } catch (error) {
      if (error.message === "Friend request not found") {
        return res
          .status(404)
          .json({ code: 404, message: "Không tìm thấy lời mời kết bạn" });
      }

      console.error("Có lỗi khi từ chối lời mời kết bạn:", error);
      return res
        .status(500)
        .json({ code: 500, message: "Có lỗi khi từ chối lời mời kết bạn" });
    }
  },

  /**
   * Lấy danh sách lời mời kết bạn
   * GET /api/friends/requests/:userId
   */
  getFriendRequests: async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ code: 400, message: "Thiếu ID người dùng" });
    }

    try {
      const requests = await FriendModel.getFriendRequests(userId);
      return res.status(200).json({
        code: 200,
        data: requests,
      });
    } catch (error) {
      console.error("Có lỗi khi lấy danh sách lời mời kết bạn:", error);
      return res.status(500).json({
        code: 500,
        message: "Có lỗi khi lấy danh sách lời mời kết bạn",
      });
    }
  },
};

module.exports = FriendController;
