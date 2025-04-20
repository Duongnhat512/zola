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
    
    const checkParams = {
      TableName: friendRequestTableName,
      Key: {
        user_id: user_id,
        user_friend_id: user_friend_id,
      },
    };
  
    try {
      const existing = await dynamodb.get(checkParams).promise();
      if (existing.Item) {
        return { success: false, message: "Friend request already exists" };
      }
  
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
      const getParams = {
        TableName: friendRequestTableName,
        Key: {
          user_id: user_id,
          user_friend_id: user_friend_id,
        },
      };
  
      const result = await dynamodb.get(getParams).promise();
      if (!result.Item) {
        throw new Error("Friend request not found");
      }
  
      const updateParams = {
        TableName: friendRequestTableName,
        Key: {
          user_id: user_id,
          user_friend_id: user_friend_id,
        },
        UpdateExpression: "set #status = :status, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": "rejected",
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      };
  
      const updateResult = await dynamodb.update(updateParams).promise();
      console.log("Updated item:", updateResult.Attributes);
  
      return { success: true };
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      throw error;
    }
  }
  ,

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
  deleteBothSides: async (tableName, user_id, user_friend_id) => {
    const params1 = {
      TableName: tableName,
      Key: {
        user_id,
        user_friend_id,
      },
    };
  
    const params2 = {
      TableName: tableName,
      Key: {
        user_id: user_friend_id,
        user_friend_id: user_id,
      },
    };
  
    try {
      await Promise.all([
        dynamodb.delete(params1).promise(),
        dynamodb.delete(params2).promise(),
      ]);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting data in table ${tableName}:`, error);
      throw new Error(`Failed to delete records in ${tableName}`);
    }
  },
  
  deleteRequest : async (user_id, user_friend_id) => {
    const params1 = {
      TableName: friendRequestTableName,
      Key: {
        user_id,
        user_friend_id,
      },
    };
  
    const params2 = {
      TableName: friendRequestTableName,
      Key: {
        user_id: user_friend_id,
        user_friend_id: user_id,
      },
    };
  
    try {
      await Promise.all([
        dynamodb.delete(params1).promise(),
        dynamodb.delete(params2).promise(),
      ]);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting data in table ${tableName}:`, error);
      throw new Error(`Failed to delete records in ${tableName}`);
    }
  },
  
  deleteFriend : async (user_id, user_friend_id) => {
    const params1 = {
      TableName: friendTableName,
      Key: {
        user_id,
        user_friend_id,
      },
    };
  
    const params2 = {
      TableName: friendTableName,
      Key: {
        user_id: user_friend_id,
        user_friend_id: user_id,
      },
    };
  
    try {
      await Promise.all([
        dynamodb.delete(params1).promise(),
        dynamodb.delete(params2).promise(),
      ]);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting data in table ${tableName}:`, error);
      throw new Error(`Failed to delete records in ${tableName}`);
    }
  },
  
  getRequestByUserIdAndUserFriendId: async (user_id, user_friend_id) => {
      const params1 = {
        TableName: friendRequestTableName,
        Key: {
          user_id: user_id,
          user_friend_id: user_friend_id,
        },
      };
    
      const params2 = {
        TableName: friendRequestTableName,
        Key: {
          user_id: user_friend_id,
          user_friend_id: user_id,
        },
      };
    
      try {
        const result1 = await dynamodb.get(params1).promise();
        
        if (result1.Item) return result1.Item;
    
        const result2 = await dynamodb.get(params2).promise();
        if (result2.Item) return result2.Item;
    
        return null; // Không tìm thấy ở cả hai chiều
      } catch (error) {
        console.error("Error getting friend request:", error);
        throw error;
      }
    },
    getFriendByPhoneNumberOrName: async (user_id, search) => {
      const getListFriends = await FriendModel.getListFriends(user_id);
    
      const friendIds = getListFriends.map((friend) => friend.user_friend_id);
    
      // Dynamodb không hỗ trợ trực tiếp `IN (:arr)` nên cần generate OR
      const friendConditions = friendIds.map((id, index) => `user_id = :fid${index}`).join(" OR ");
    
      const expressionParts = [
        "phone = :search",
        "contains(#fullname, :search)" // Sử dụng contains để tìm kiếm tương đối
      ];
    
      if (friendConditions) {
        expressionParts.push(`(${friendConditions})`);
      }
    
      const FilterExpression = expressionParts.join(" OR ");
    
      const ExpressionAttributeValues = {
        ":search": search
      };
    
      // Gán từng giá trị friendId vào ExpressionAttributeValues
      friendIds.forEach((id, index) => {
        ExpressionAttributeValues[`:fid${index}`] = id;
      });
    
      const params = {
        TableName: tableName,
        FilterExpression,
        ExpressionAttributeNames: {
          "#fullname": "fullname", // tránh từ khóa dự trữ
        },
        ExpressionAttributeValues,
      };
    
      try {
        const data = await dynamodb.scan(params).promise();
        return data.Items.filter((item) => item.user_id !== user_id); // loại chính mình ra
      } catch (error) {
        console.error("Error finding friends by phone number or name:", error);
        throw error;
      }
    }
    
  
  
};

module.exports = FriendModel;
