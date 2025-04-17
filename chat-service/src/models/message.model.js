const { dynamodb } = require("../utils/aws.helper");
const { v4: uuidv4 } = require("uuid");

const tableName = "messages"

const hiddenMessageTable = "hidden_messages"

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
                id: messageId,
                conversation_id: message.conversation_id || "",
                sender_id: message.sender_id,
                receiver_id: message.receiver_id,
                type: message.type || "text",
                message: message.message,
                media: message.media || "",
                status: message.status,
                file_name: message.file_name || "",
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

    /**`
     * Lấy danh sách tin nhắn trong cuộc hội thoại theo conversation_id
     * @param {String} conversation_id 
     * @returns 
     */
    getMessages: async (conversation_id, user_id) => {
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
            let messages = data.Items;

            if (user_id) {
                const hiddenParams = {
                    TableName: hiddenMessageTable,
                    IndexName: "user-id-index",
                    KeyConditionExpression: "user_id = :user_id",
                    ExpressionAttributeValues: {
                        ":user_id": user_id,
                    },
                };

                const hiddenData = await dynamodb.query(hiddenParams).promise();
                const hiddenMessageIds = hiddenData.Items.map(item => item.message_id);

                // Filter out messages that are in the hidden list
                messages = messages.filter(message => !hiddenMessageIds.includes(message.message_id));
            }

            return messages;
        } catch (error) {
            console.error("Error getting messages:", error);
            throw new Error("Error getting messages");
        }
    },

    updateMessage: async (message_id, updatedMessage) => {
        const params = {
            TableName: tableName,
            Key: {
                id: message_id,
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
            Key: {
                id: message_id,
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
            IndexName: "conversation-id-index",
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
            IndexName: "sender-id-index",
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
            IndexName: "receiver-id-index",
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
            Key: {
                id: message_id,
            },
        };

        // Xóa tin nhắn
    },
    
    setHiddenMessage: async (user_id, message_id) => {
        const params = {
            TableName: hiddenMessageTable,
            Item: {
                user_id: user_id,
                message_id: message_id,
                created_at: new Date().toISOString(),
            },
        };

        try {
            await dynamodb.put(params).promise();
            return { message: "Ẩn tin nhắn thành công" };
        } catch (error) {
            console.error("Error hiding message:", error);
            throw new Error("Error hiding message");
        }
    },

    findHiddenMessage: async (user_id, message_id) => {
        const params = {
            TableName: hiddenMessageTable,
            KeyConditionExpression: "user_id = :user_id and message_id = :message_id",
            ExpressionAttributeValues: {
                ":user_id": user_id,
                ":message_id": message_id,
            },
        };

        try {
            const data = await dynamodb.query(params).promise();
            return data.Items.length > 0;
        } catch (error) {
            console.error("Error finding hidden message:", error);
            throw new Error("Error finding hidden message");
        }
    },

}

module.exports = MessageModel;