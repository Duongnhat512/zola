const { dynamodb } = require("../utils/aws.helper");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const tableName = "calls";

const CallModel = {
  createCall: async (callData) => {
    const callId = uuidv4();
    const params = {
      TableName: tableName,
      Item: {
        id: callId,
        conversation_id: callData.conversation_id,
        initiator_id: callData.initiator_id,
        participants: callData.participants || [],
        status: "pending",
        type: callData.type || "video", // 'video' hoặc 'audio'
        start_time: new Date().toISOString(),
        end_time: null,
        created_at: new Date().toISOString(),
      },
    };

    try {
      await dynamodb.put(params).promise();
      return { ...params.Item };
    } catch (error) {
      console.error("Lỗi khi tạo cuộc gọi:", error);
      throw new Error("Lỗi khi tạo cuộc gọi");
    }
  },

  updateCallStatus: async (callId, status) => {
    const params = {
      TableName: tableName,
      Key: {
        id: callId,
      },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      const result = await dynamodb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái cuộc gọi:", error);
      throw new Error("Lỗi khi cập nhật trạng thái cuộc gọi");
    }
  },

  endCall: async (callId) => {
    const params = {
      TableName: tableName,
      Key: {
        id: callId,
      },
      UpdateExpression: "set end_time = :end_time, #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":end_time": new Date().toISOString(),
        ":status": "ended",
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      const result = await dynamodb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error("Lỗi khi kết thúc cuộc gọi:", error);
      throw new Error("Lỗi khi kết thúc cuộc gọi");
    }
  },

  getCallById: async (callId) => {
    const params = {
      TableName: tableName,
      Key: {
        id: callId,
      },
    };

    try {
      const result = await dynamodb.get(params).promise();
      return result.Item;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin cuộc gọi:", error);
      throw new Error("Lỗi khi lấy thông tin cuộc gọi");
    }
  },

  getActiveCallsByConversationId: async (conversationId) => {
    const params = {
      TableName: tableName,
      IndexName: "conversation_id-index",
      KeyConditionExpression: "conversation_id = :conversation_id",
      FilterExpression: "#status <> :ended",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":conversation_id": conversationId,
        ":ended": "ended"
      },
    };
  
    try {
      const result = await dynamodb.query(params).promise();
      return result.Items;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cuộc gọi:", error);
      throw new Error("Lỗi khi lấy danh sách cuộc gọi");
    }
  },
};

module.exports = CallModel;
