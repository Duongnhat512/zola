const { dynamodb } = require("../utils/aws.helper");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const tableName = "users";
const friendTableName = "friends";
const friendRequestTableName = "friend_requests";

const FriendModel = {
  findUserByPhoneNumber: async (phoneNumber) => {
    const params = {
      TableName: tableName,
      FilterExpression: "phone = :phone",
      ExpressionAttributeValues: {
        ":phone": phoneNumber,
      },
    };
    try {
      const data = await dynamodb.scan(params).promise();
      return data.Items.length > 0 ? data.Items[0] : null;
    } catch (error) {
      console.error("Số điện thoại không hợp lệ");
      throw new Error("Error finding user by phone number");
    }
  },

  createFriendRequest: async (user_id, user_friend_id) => {
    // Kiểm tra xem yêu cầu đã tồn tại chưa
    const checkParams = {
      TableName: friendRequestTableName,
      KeyConditionExpression:
        "user_id = :user_id AND user_friend_id = :user_friend_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
        ":user_friend_id": user_friend_id,
      },
    };

    try {
      // const existing = await dynamodb.query(checkParams).promise();

      // if (existing.Items && existing.Items.length > 0) {
      //   throw new Error("Friend request already exists");
      // }

      // Tạo yêu cầu mới
      const params = {
        TableName: friendRequestTableName,
        Item: {
          user_id: user_id,
          user_friend_id: user_friend_id,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      };

      await dynamodb.put(params).promise();
      return { success: true };
    } catch (error) {
      console.error("Error creating friend request:", error);
      throw error;
    }
  },

  acceptFriendRequest: async (user_id, user_friend_id) => {
    try {
      // Truy vấn trực tiếp bằng khoá chính và khoá phân loại
      const getParams = {
        TableName: friendRequestTableName,
        Key: {
          user_id: user_friend_id,
          user_friend_id: user_id,
        },
      };

      const result = await dynamodb.get(getParams).promise();
      if (!result.Item) {
        throw new Error("Friend request not found");
      }

      // Cập nhật trạng thái yêu cầu
      const updateParams = {
        TableName: friendRequestTableName,
        Key: {
          user_id: user_friend_id,
          user_friend_id: user_id,
        },
        UpdateExpression: "set #status = :status, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": "accepted",
          ":updatedAt": new Date().toISOString(),
        },
      };

      await dynamodb.update(updateParams).promise();

      // Thêm vào danh sách bạn bè cho cả hai người dùng
      const friend1Params = {
        TableName: friendTableName,
        Item: {
          user_id: user_id,
          user_friend_id: user_friend_id,
          createdAt: new Date().toISOString(),
        },
      };

      const friend2Params = {
        TableName: friendTableName,
        Item: {
          user_id: user_friend_id,
          user_friend_id: user_id,
          createdAt: new Date().toISOString(),
        },
      };

      await dynamodb.put(friend1Params).promise();
      await dynamodb.put(friend2Params).promise();

      return { success: true };
    } catch (error) {
      console.error("Error accepting friend request:", error);
      throw error;
    }
  },

  rejectFriendRequest: async (user_id, user_friend_id) => {
    try {
      // Truy vấn trực tiếp bằng khoá chính và khoá phân loại
      const getParams = {
        TableName: friendRequestTableName,
        Key: {
          user_id: user_friend_id,
          user_friend_id: user_id,
        },
      };

      const result = await dynamodb.get(getParams).promise();
      if (!result.Item) {
        throw new Error("Friend request not found");
      }

      // Cập nhật trạng thái thành từ chối
      const updateParams = {
        TableName: friendRequestTableName,
        Key: {
          user_id: user_friend_id,
          user_friend_id: user_id,
        },
        UpdateExpression: "set #status = :status, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": "rejected",
          ":updatedAt": new Date().toISOString(),
        },
      };

      await dynamodb.update(updateParams).promise();
      return { success: true };
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      throw error;
    }
  },

  // Lấy danh sách gửi lời mời kết bạn
  getFriendRequests: async (user_id) => {
    const params = {
      TableName: friendRequestTableName,
      KeyConditionExpression: "user_id = :user_id", // Chỉ dùng PK ở đây
      FilterExpression: "#status = :status", // Lọc thêm status
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":user_id": user_id,
        ":status": "pending",
      },
    };

    try {
      const result = await dynamodb.query(params).promise();
      return result.Items || [];
    } catch (error) {
      console.error("Error getting friend requests:", error);
      throw error;
    }
  },
  //get danh sách yêu cầu kết bạn
  getReceivedFriendRequests: async (user_friend_id) => {
    const params = {
      TableName: friendRequestTableName,
      FilterExpression:
        "user_friend_id = :user_friend_id AND #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":user_friend_id": user_friend_id,
        ":status": "pending",
      },
    };

    try {
      const result = await dynamodb.scan(params).promise();
      return result.Items || [];
    } catch (error) {
      console.error("Error getting received friend requests:", error);
      throw error;
    }
  },
  getListFriends: async (user_id) => {
    const params = {
      TableName: friendTableName,
      KeyConditionExpression: "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
      },
    };

    try {
      const result = await dynamodb.query(params).promise();
      return result.Items || [];
    } catch (error) {
      console.error("Error getting friends:", error);
      throw error;
    }
  },
};

module.exports = FriendModel;
