const FriendModel = require("../models/friend.model");
const { socketService } = require("../../server");
const redisClient = require("../configs/redis.config");

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
  createFriendRequest: async (socket, data) => {
  const user_id = data.user_id;
  const user_friend_id = data.user_friend_id;

  // Kiểm tra dữ liệu đầu vào
  if (!user_id || !user_friend_id) {
    return socket.emit("friend_request_error", {
      code: 400,
      message: "Thiếu thông tin người dùng",
    });
  }

  // Không được gửi lời mời cho chính mình
  if (user_id === user_friend_id) {
    return socket.emit("friend_request_error", {
      code: 400,
      message: "Không thể gửi lời mời kết bạn cho chính mình",
    });
  }  
  try {
    const result = await FriendModel.createFriendRequest(user_id, user_friend_id);

    // Gửi thông báo đến chính người gửi lời mời
    socket.emit("friend_request_sent", {
      code: 200,
      message: "Đã gửi lời mời kết bạn thành công",
      data: result, // tùy bạn có muốn trả về thêm dữ liệu gì không
      to: user_friend_id,
    });
    const socketId = await redisClient.smembers(`sockets:${user_friend_id}`);
    console.log("receiverSocketId", socketId);
    
    if (socketId) {
      socket.to(socketId).emit("new_friend_request", {
        from: user_id,
        message: "Bạn có một lời mời kết bạn mới",
        data: result,
        user_friend_id: user_friend_id,
      });
    }
  } catch (error) {
    if (error.message === "Friend request already exists") {
      return socket.emit("friend_request_error", {
        code: 409,
        message: "Đã tồn tại lời mời kết bạn",
      });
    }

    console.error("Lỗi khi gửi lời mời kết bạn:", error);
    return socket.emit("friend_request_error", {
      code: 500,
      message: "Có lỗi khi gửi lời mời kết bạn",
    });
  }
},


  /**
   * Chấp nhận lời mời kết bạn
   * PUT /api/friends/accept
   * Body: { user_id, user_friend_id }
   */
  acceptFriendRequest: async (socket, data) => {
  const { user, user_friend } = data;  
  if (!user || !user_friend) {
    return socket.emit("friend_request_accept_error", {
      code: 400,
      message: "Thiếu thông tin người dùng",
    });
  }

  try {
    const result = await FriendModel.acceptFriendRequest(user, user_friend);

    // Gửi phản hồi về cho người chấp nhận
    socket.emit("friend_request_accepted", {
      code: 200,
      message: "Đã chấp nhận lời mời kết bạn thành công",
      data: result,
    });

    // Gửi thông báo đến người đã gửi lời mời kết bạn
    const socketIds = await redisClient.smembers(`sockets:${user_friend.id}`);
    console.log("senderSocketId", socketIds);
    
    if (socketIds && socketIds.length > 0) {
      socketIds.forEach(id => {
        socket.to(id).emit("friend_request_accepted_notify", {
          from: user.id,
          message: "Lời mời kết bạn của bạn đã được chấp nhận",
          data: result,
          status: "success"
        });
      });
    }

  } catch (error) {
    if (error.message === "Friend request not found") {
      return socket.emit("friend_request_accept_error", {
        code: 404,
        message: "Không tìm thấy lời mời kết bạn",
      });
    }

    console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
    return socket.emit("friend_request_accept_error", {
      code: 500,
      message: "Có lỗi khi chấp nhận lời mời kết bạn",
    });
  }
},
  /**
   * Từ chối lời mời kết bạn
   * PUT /api/friends/reject
   * Body: { user_id, user_friend_id }
   */
rejectFriendRequest: async (socket, data) => {
  const { user_id, user_friend_id } = data;

  if (!user_id || !user_friend_id) {
    return socket.emit("error", {
      code: 400,
      message: "Thiếu thông tin người dùng",
    });
  }

  try {
    await FriendModel.rejectFriendRequest(user_id, user_friend_id);

    // Thông báo đến client người gửi yêu cầu kết bạn
    const socketIds = await redisClient.smembers(`sockets:${user_friend_id}`);
    if (socketIds && socketIds.length > 0) {
      socket.to(socketIds).emit("friend_request_rejected", {
        from: user_id,
        message: "Lời mời kết bạn của bạn đã bị từ chối",
        user_friend_id,
        code: 200
      });
    }

    // Gửi phản hồi thành công cho client đã từ chối
    return socket.emit("friend_request_rejected", {
      code: 200,
      message: "Đã từ chối lời mời kết bạn thành công",
      data: { user_id, user_friend_id },
    });
  } catch (error) {
    if (error.message === "Friend request not found") {
      return socket.emit("error", {
        code: 404,
        message: "Không tìm thấy lời mời kết bạn",
      });
    }

    console.error("Có lỗi khi từ chối lời mời kết bạn:", error);
    return socket.emit("error", {
      code: 500,
      message: "Có lỗi khi từ chối lời mời kết bạn",
    });
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
  getSendFriendRequests: async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ code: 400, message: "Thiếu ID người dùng" });
    }

    try {
      const requests = await FriendModel.getReceivedFriendRequests(userId);
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
  getListFriends: async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ code: 400, message: "Thiếu ID người dùng" });
    }

    try {
      const friends = await FriendModel.getListFriends(userId);
      return res.status(200).json({
        code: 200,
        data: friends,
      });
    } catch (error) {
      console.error("Có lỗi khi lấy danh sách bạn bè:", error);
      return res.status(500).json({
        code: 500,
        message: "Có lỗi khi lấy danh sách bạn bè",
      });
    }
  },
  deleteRequest: async (socket, data) => {
  const { user_id, user_friend_id } = data;

  if (!user_id || !user_friend_id) {
    return socket.emit("error", {
      code: 400,
      message: "Thiếu ID người dùng",
    });
  }

  try {
    await FriendModel.deleteRequest(user_id, user_friend_id);

    // Gửi thông báo đến người nhận lời mời kết bạn (nếu họ đang online)
    const receiverSocketIds = await redisClient.smembers(`sockets:${user_friend_id}`);
    if (receiverSocketIds && receiverSocketIds.length > 0) {
      socket.to(receiverSocketIds).emit("friend_request_deleted_notify", {        
        code: 200,
        from: user_id,
        message: "Lời mời kết bạn đã bị thu hồi",
        user_friend_id,
      });
    }

    // Gửi phản hồi thành công cho người thu hồi
    return socket.emit("friend_request_deleted", {
      code: 200,
      message: "Đã thu hồi lời mời kết bạn thành công",
      data: { user_id, user_friend_id },
    });
  } catch (error) {
    console.error("Có lỗi khi thu hồi lời mời kết bạn:", error);
    return socket.emit("error", {
      code: 500,
      message: "Có lỗi khi thu hồi lời mời kết bạn",
    });
  }
},

  deleteFriend: async (socket, data) => {
  const { user_id, user_friend_id } = data;

  console.log("user_id", user_id);
  console.log("user_friend_id", user_friend_id);
  
  if (!user_id || !user_friend_id) {
    return socket.emit("error", {
      code: 400,
      message: "Thiếu ID người dùng",
    });
  }

  try {
    await FriendModel.deleteFriend(user_id, user_friend_id);
    await FriendModel.deleteRequest(user_id, user_friend_id);

    // Gửi thông báo về cho người dùng hiện tại
    socket.emit("friend_deleted", {
      code: 200,
      message: "Đã xóa bạn bè thành công",
      data: {
        user_id,
        user_friend_id,
      },
    });

    // Thông báo cho người bạn kia nếu họ đang online
    const receiverSocketIds = await redisClient.smembers(`sockets:${user_friend_id}`);
    if (receiverSocketIds && receiverSocketIds.length > 0) {
      receiverSocketIds.forEach((receiverSocketId) => {
        socket.to(receiverSocketId).emit("friend_deleted_notify", {
          code: 200,
          message: "Bạn đã bị hủy kết bạn",
          data: {
            user_id,
            user_friend_id,
          },
        });
      });
    }

  } catch (error) {
    console.error("Có lỗi khi xóa bạn bè:", error);
    socket.emit("error", {
      code: 500,
      message: "Có lỗi khi xóa bạn bè",
    });
  }
},

  getRequestByUserIdAndUserFriendId: async (req, res) => {
    const { user_id, user_friend_id } = req.query;

    if (!user_id || !user_friend_id) {
      return res
        .status(400)
        .json({ code: 400, message: "Thiếu ID người dùng" });
    }


    try {
      const request = await FriendModel.getRequestByUserIdAndUserFriendId(
        user_id,
        user_friend_id
      );
      return res.status(200).json({
        code: 200,
        data: request,
      });
    } catch (error) {
      console.error("Có lỗi khi lấy lời mời kết bạn:", error);
      return res.status(500).json({
        code: 500,
        message: "Có lỗi khi lấy lời mời kết bạn",
      });
    }
  },
  getFriendByPhoneNumberOrfullName: async (req, res) => {
    const { user_id } = req.query;
    const { search } = req.query;

    if (!user_id) {
      return res
        .status(400)
        .json({ code: 400, message: "Thiếu ID người dùng" });
    }

    try {
      const friends = await FriendModel.getFriendByPhoneNumberOrName(
        user_id,
        search
      );
      return res.status(200).json({
        code: 200,
        data: friends,
      });
    } catch (error) {
      console.error("Có lỗi khi tìm kiếm bạn bè:", error);
      return res.status(500).json({
        code: 500,
        message: "Có lỗi khi tìm kiếm bạn bè",
      });
    }
  },
  
};

module.exports = FriendController;
