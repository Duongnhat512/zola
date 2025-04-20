const { get, joinRoom, muteMember } = require("../controllers/conversation.controller");
const { dynamodb } = require("../utils/aws.helper");
const { v4: uuidv4 } = require("uuid");
const { generateConversationId } = require("../utils/conversation.helper");

const memberTableName = "conversation_members";
const tableName = "conversations";

const ConversationModel = {
  getConversationsById: async (conversationId) => {
    const params = {
      TableName: tableName,
      Key: {
        id: conversationId,
      },
    };
    try {
      const result = await dynamodb.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error("Có lỗi khi lấy danh sách hội thoại:", error);
      throw new Error("Có lỗi khi lấy danh sách hội thoại");
    }
  },

  /**
   * Tạo conversation
   * @param {Object} conversation
   * @returns {Object} conversation
   */
  createConversation: async (conversation) => {
    if (conversation.type === "private") {
      conversation.id = generateConversationId(
        conversation.members[0],
        conversation.members[1]
      );
    } else {
      conversation.id = uuidv4();
    }
    const params = {
      TableName: tableName,
      Item: {
        id: conversation.id,
        created_by: conversation.created_by,
        name: conversation.name || "",
        description: conversation.description || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        status: conversation.status || "active",
        type: conversation.type || "private",
        avatar: conversation.avatar || "",
        no_of_member: conversation.members ? conversation.members.length : 0,
        is_user_remove: 0,
      },
    };
    try {
      await dynamodb.put(params).promise();

      if (conversation.members && conversation.members.length > 0) {
        const memberPromises = conversation.members.map((userId) => {
          let permissions = "";

          if (conversation.type === "group") {
            if (userId === conversation.created_by) {
              permissions = "owner";
            } else {
              permissions = "member";
            }
          }
          return dynamodb
            .put({
              TableName: memberTableName,
              Item: {
                conversation_id: conversation.id,
                user_id: userId,
                created_at: new Date().toISOString(),
                permissions: permissions || "",
              },
            })
            .promise();
        });

        await Promise.all(memberPromises);
      }

      return conversation;
    } catch (error) {
      console.error("Có lỗi khi tạo hội thoại:", error);
      throw new Error("Có lỗi khi tạo hội thoại");
    }
  },

  deleteConversation: async (conversationId) => {
    const params = {
      TableName: tableName,
      Key: { id: conversationId },
    };
    try {
      // Xóa hội thoại
      await dynamodb.delete(params).promise();

      const memberParams = {
        TableName: memberTableName,
        KeyConditionExpression: "conversation_id = :conversationId",
        ExpressionAttributeValues: {
          ":conversationId": conversationId,
        },
      };
      const memberResult = await dynamodb.query(memberParams).promise();
      const members = memberResult.Items || [];

      await Promise.all(
        members.map((member) =>
          dynamodb.delete({
            TableName: memberTableName,
            Key: {
              conversation_id: member.conversation_id,
              user_id: member.user_id,
            },
          }).promise()
        )
      );

      return {
        message: "Hội thoại đã được xóa thành công",
        deleted_members: members.map((m) => m.user_id),
      };
    } catch (error) {
      console.error("Có lỗi khi xóa hội thoại:", error);
      throw new Error("Có lỗi khi xóa hội thoại");
    }
  },

  updateConversationName: async (conversationId, conversation) => {
    const params = {
      TableName: tableName,
      Key: {
        id: conversationId,
      },
      UpdateExpression: "set #name = :name",
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":name": conversation.name,
      },
      ReturnValues: "UPDATED_NEW",
    };
    try {
      const result = await dynamodb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error("Có lỗi khi cập nhật hội thoại:", error);
      throw new Error("Có lỗi khi cập nhật hội thoại");
    }
  },

  updateConversationAvatar: async (conversationId, conversation) => {
    const params = {
      TableName: tableName,
      Key: {
        id: conversationId,
      },
      UpdateExpression: "set #avatar = :avatar",
      ExpressionAttributeNames: {
        "#avatar": "avatar",
      },
      ExpressionAttributeValues: {
        ":avatar": conversation.avatar,
      },
      ReturnValues: "UPDATED_NEW",
    };
    try {
      const result = await dynamodb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error("Có lỗi khi cập nhật hội thoại:", error);
      throw new Error("Có lỗi khi cập nhật hội thoại");
    }
  },

  /**
   * Tìm conversation giữa 2 user
   * @param {String} user1Id
   * @param {String} user2Id
   * @returns
   */
  findPrivateConversation: async (user1Id, user2Id) => {
    const conversationId = generateConversationId(user1Id, user2Id);

    const params = {
      TableName: tableName,
      Key: {
        id: conversationId,
      },
    };
    try {
      const result = await dynamodb.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error("Có lỗi khi tìm hội thoại:", error);
      throw new Error("Có lỗi khi tìm hội thoại");
    }
  },

  /**
   * Tìm danh sách thành viên có trong hội thoại
   * @param {String} conversationId
   * @returns {Array} danh sách thành viên
   */
  // getConversationMembers: async (conversationId) => {
  //   const params = {
  //     TableName: memberTableName,
  //     IndexName: "id-index",
  //     KeyConditionExpression: "id = :conversationId",
  //     ExpressionAttributeValues: {
  //       ":conversationId": conversationId,
  //     },
  //   };

  //   try {
  //     const result = await dynamodb.query(params).promise();
  //     return result.Items;
  //   } catch (error) {
  //     console.error("Lỗi khi lấy thành viên hội thoại:", error);
  //     throw new Error("Lỗi khi lấy thành viên hội thoại");
  //   }
  // },

  /**
   * Lấy thông tin hội thoại theo ID
   * @param {String} conversationId
   * @returns
   */
  getConversationById: async (conversationId) => {
    const params = {
      TableName: tableName,
      Key: {
        id: conversationId,
      },
    };
    try {
      const result = await dynamodb.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error("Có lỗi khi lấy hội thoại:", error);
      throw new Error("Có lỗi khi lấy hội thoại");
    }
  },

  updateLastMessage: async (conversationId, lastMessage) => {
    const params = {
      TableName: tableName,
      Key: {
        id: conversationId,
      },
      UpdateExpression: "set last_message_id = :last_message_id, updated_at = :updated_at",
      ExpressionAttributeValues: {
        ":last_message_id": lastMessage,
        ":updated_at": new Date().toISOString(),
      },
      ReturnValues: "UPDATED_NEW",
    };
    try {
      const result = await dynamodb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error("Có lỗi khi cập nhật hội thoại:", error);
      throw new Error("Có lỗi khi cập nhật hội thoại");
    }
  },

  getConversationByUserId: async (userId) => {
    const params = {
      TableName: memberTableName,
      IndexName: "userId-index",
      KeyConditionExpression: "user_id = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    try {
      const result = await dynamodb.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error("Có lỗi khi lấy hội thoại:", error);
      throw new Error("Có lỗi khi lấy hội thoại");
    }
  },

  /**
   * Tìm danh sách thành viên có trong hội thoại
   * @param {String} conversationId
   * @returns {Array} danh sách thành viên
   */
  getAllUserInConversation: async (conversationId) => {
    const params = {
      TableName: memberTableName,
      IndexName: "conversation-id-index",
      KeyConditionExpression: "conversation_id = :conversationId",
      ExpressionAttributeValues: {
        ":conversationId": conversationId,
      },
    };

    try {
      const result = await dynamodb.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error("Có lỗi khi lấy danh sách thành viên hội thoại:", error);
      throw new Error("Có lỗi khi lấy danh sách thành viên hội thoại");
    }
  },

  getLastMessage: async (conversationId) => {
    const params = {
      TableName: tableName,
      Key: {
        id: conversationId,
      },
    };

    try {
      const result = await dynamodb.get(params).promise();
      return result.Item ? result.Item.last_message_id : null;
    } catch (error) {
      console.error("Có lỗi khi lấy hội thoại:", error);
      throw new Error("Có lỗi khi lấy hội thoại");
    }
  },

  addMember: async (userId, conversationId) => {
    const params = {
      TableName: memberTableName,
      Item: {
        conversation_id: conversationId,
        user_id: userId,
        created_at: new Date().toISOString(),
      },
    };

    try {
      const result = await dynamodb.put(params).promise();
      return result.Item;
    } catch (error) {
      console.error("Có lỗi khi tham gia hội thoại:", error);
      throw new Error("Có lỗi khi tham gia hội thoại");
    }
  },

  removeMember: async (userId, conversationId) => {
    const params = {
      TableName: memberTableName,
      Key: {
        conversation_id: conversationId,
        user_id: userId,
      },
    };

    try {
      await dynamodb.delete(params).promise();
      return { message: "Đã rời khỏi hội thoại" };
    } catch (error) {
      console.error("Có lỗi khi rời khỏi hội thoại:", error);
      throw new Error("Có lỗi khi rời khỏi hội thoại");
    }
  },

  setPermissions: async (userId, conversationId, permissions) => {
    const params = {
      TableName: memberTableName,
      Key: {
        conversation_id: conversationId,
        user_id: userId,
      },
      UpdateExpression: "set #permissions = :permissions",
      ExpressionAttributeNames: {
        "#permissions": "permissions",
      },
      ExpressionAttributeValues: {
        ":permissions": permissions,
      },
    };

    try {
      await dynamodb.update(params).promise();
      return { message: "Cập nhật quyền thành công" };
    } catch (error) {
      console.error("Có lỗi khi cập nhật quyền:", error);
      throw new Error("Có lỗi khi cập nhật quyền");
    }
  },

  getPermissions: async (userId, conversationId) => {
    const params = {
      TableName: memberTableName,
      Key: {
        conversation_id: conversationId,
        user_id: userId,
      },
    };

    try {
      const result = await dynamodb.get(params).promise();
      return result.Item ? result.Item.permissions : null;
    } catch (error) {
      console.error("Có lỗi khi lấy quyền:", error);
      throw new Error("Có lỗi khi lấy quyền");
    }
  },

  muteMember: async (userId, conversationId) => {
    const params = {
      TableName: memberTableName,
      Key: {
        conversation_id: conversationId,
        user_id: userId,
      },
      UpdateExpression: "set is_mute = :is_mute",
      ExpressionAttributeValues: {
        ":is_mute": true,
      },
    };

    try {
      await dynamodb.update(params).promise();
      return { message: "Đã tắt thông báo hội thoại" };
    } catch (error) {
      console.error("Có lỗi khi tắt thông báo hội thoại:", error);
      throw new Error("Có lỗi khi tắt thông báo hội thoại");
    }
  },

  unmuteMember: async (userId, conversationId) => {
    const params = {
      TableName: memberTableName,
      Key: {
        conversation_id: conversationId,
        user_id: userId,
      },
      UpdateExpression: "set is_mute = :is_mute",
      ExpressionAttributeValues: {
        ":is_mute": false,
      },
    };

    try {
      await dynamodb.update(params).promise();
      return { message: "Đã bật thông báo hội thoại" };
    } catch (error) {
      console.error("Có lỗi khi bật thông báo hội thoại:", error);
      throw new Error("Có lỗi khi bật thông báo hội thoại");
    }
  },

  outGroup: async (userId, conversationId) => {
    const params = {
      TableName: memberTableName,
      Key: {
        conversation_id: conversationId,
        user_id: userId,
      },
    };

    try {
      await dynamodb.delete(params).promise();
      return { message: "Đã rời khỏi nhóm" };
    } catch (error) {
      console.error("Có lỗi khi rời khỏi nhóm:", error);
      throw new Error("Có lỗi khi rời khỏi nhóm");
    }
  }

};

module.exports = ConversationModel;
