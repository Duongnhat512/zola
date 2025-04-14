const { sendImage } = require("../controllers/message.controller");
const { dynamodb } = require("../utils/aws.helper");
const ConversationModel = require("./conversation.model");
const { v4: uuidv4 } = require("uuid");

const tableName = "messages"

const MessageModel = {
    /**
     * Gửi text message
     * @param {Object} message 
     * @returns {Object} message
     */
    sendMessage: async (message) => {
        const messageId = uuidv4();
        const params = {
            TableName: tableName,
            Item: {
                message_id: messageId,
                conversation_id: message.conversation_id,
                sender_id: message.sender_id,
                receiver_id: message.receiver_id,
                type: message.type || "text",
                message: message.message,
                media: message.media || "",
                status: message.status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_deleted: false,
            },
        };
        try {
            const data = await dynamodb.put(params).promise();
            return {
                message_id: messageId,
                ...message,
            };
        } catch (error) {
            console.error("Error sending message:", error);
            throw new Error("Error sending message");
        }
    },

    /**
     * Gửi image message
     * @param {Object} message 
     * @returns {Object} message
     */
    sendImage: async (message) => {
        const messageId = uuidv4();
        const params = {
            TableName: tableName,
            Item: {
                message_id: messageId,
                conversation_id: message.conversation_id,
                sender_id: message.sender_id,
                receiver_id: message.receiver_id,
                type: "image",
                message: message.message,
                media: message.media,
                status: message.status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_deleted: false,
            },
        };
        try {
            await dynamodb.put(params).promise();
            return message;
        } catch (error) {
            console.error("Error sending image:", error);
            throw new Error("Error sending image");
        }
    },
    
    /**
     * Lấy danh sách tin nhắn trong cuộc hội thoại theo conversation_id
     * @param {String} conversation_id 
     * @returns 
     */
    getMessages: async (conversation_id) => {
        if (!conversation_id) {
            throw new Error("conversation_id is required");
        }
    
        const params = {
            TableName: tableName,
            KeyConditionExpression: "conversation_id = :conversation_id",
            ExpressionAttributeValues: {
                ":conversation_id": conversation_id,
            },
        };
    
        try {
            const data = await dynamodb.query(params).promise();
            return data.Items;
        } catch (error) {
            console.error("Error getting messages:", error);
            throw new Error("Error getting messages");
        }
    },

    deleteMessage: async (message_id) => {
        const params = {
            TableName: tableName,
            IndexName: "message-id-index",
        };
        try {
            await dynamodb.delete(params).promise();
            return { message: "Xóa tin nhắn thành công" };
        } catch (error) {
            console.error("Lỗi khi xóa tin nhắn:", error);
            throw new Error("Lỗi khi xóa tin nhắn");
        }
    },

    updateMessage: async (message_id, updatedMessage) => {
        const params = {
            TableName: tableName,
            Key: {
                message_id: message_id,
            },
            UpdateExpression: "set #message = :message, #updated_at = :updated_at",
            ExpressionAttributeNames: {
                "#message": "message",
                "#updated_at": "updated_at",
            },
            ExpressionAttributeValues: {
                ":message": updatedMessage.message,
                ":updated_at": new Date().toISOString(),
            },
        };
        try {
            await dynamodb.update(params).promise();
            return { message: "Cập nhật tin nhắn thành công" };
        } catch (error) {
            console.error("Lỗi khi cập nhật tin nhắn:", error);
            throw new Error("Lỗi khi cập nhật tin nhắn");
        }
    },

    getMessageById: async (message_id) => {
        const params = {
            TableName: tableName,
            IndexName: "message-id-index",
            KeyConditionExpression: "message_id = :message_id",
            ExpressionAttributeValues: {
                ":message_id": message_id,
            },
        };
        try {
            const data = await dynamodb.query(params).promise();
            return data.Items[0]; 
        } catch (error) {
            console.error("Error getting message:", error);
            throw new Error("Error getting message");
        }
    },
    
    getMessagesByConversationId: async (conversation_id) => {
        const params = {
            TableName: tableName,
            IndexName: "conversation_id_index",
            KeyConditionExpression: "conversation_id = :conversation_id",
            ExpressionAttributeValues: {
                ":conversation_id": conversation_id,
            },
        };
        try {
            const data = await dynamodb.query(params).promise();
            return data.Items;
        } catch (error) {
            console.error("Error getting messages by conversation ID:", error);
            throw new Error("Error getting messages by conversation ID");
        }
    },

    getMessagesBySenderId: async (sender_id) => {
        const params = {
            TableName: tableName,
            IndexName: "sender_id_index",
            KeyConditionExpression: "sender_id = :sender_id",
            ExpressionAttributeValues: {
                ":sender_id": sender_id,
            },
        };
        try {
            const data = await dynamodb.query(params).promise();
            return data.Items;
        } catch (error) {
            console.error("Error getting messages by sender ID:", error);
            throw new Error("Error getting messages by sender ID");
        }
    },

    getMessagesByReceiverId: async (receiver_id) => {
        const params = {
            TableName: tableName,
            IndexName: "receiver_id_index",
            KeyConditionExpression: "receiver_id = :receiver_id",
            ExpressionAttributeValues: {
                ":receiver_id": receiver_id,
            },
        };
        try {
            const data = await dynamodb.query(params).promise();
            return data.Items;
        } catch (error) {
            console.error("Error getting messages by receiver ID:", error);
            throw new Error("Error getting messages by receiver ID");
        }
    },
    
    deleteMessageById: async (message_id) => {
        const queryParams = {
            TableName: tableName,
            IndexName: "message-id-index",
            KeyConditionExpression: "message_id = :message_id",
            ExpressionAttributeValues: {
                ":message_id": message_id
            }
        };
        
        try {
            const queryResult = await dynamodb.query(queryParams).promise();
            if (queryResult.Items.length === 0) {
                throw new Error("Không tìm thấy tin nhắn");
            }
            
            const message = queryResult.Items[0];
            
            const updateParams = {
                TableName: tableName,
                Key: {
                    conversation_id: message.conversation_id,
                    message_id: message_id
                },
                UpdateExpression: "set is_deleted = :is_deleted, updated_at = :updated_at",
                ExpressionAttributeValues: {
                    ":is_deleted": true,
                    ":updated_at": new Date().toISOString()
                }
            };
            
            await dynamodb.update(updateParams).promise();
            return { message: "Đánh dấu xóa tin nhắn thành công" };
        } catch (error) {
            console.error("Lỗi khi xóa tin nhắn:", error);
            throw new Error("Lỗi khi xóa tin nhắn");
        }
    }
}

module.exports = MessageModel;