const { get } = require("../routes/socket.route");
const { dynamodb } = require("../utils/aws.helper");
const { v4: uuidv4 } = require("uuid");

const tableName = "messages"

const MessageModel = {
    sendMessage: async (message) => {
        const messageId = uuidv4();
        const params = {
            TableName: tableName,
            Item: {
                message_id: messageId,
                conversation_id: message.conversation_id,
                sender_id: message.sender_id,
                receiver_id: message.receiver_id,
                type: message.type,
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
            console.error("Error sending message:", error);
            throw new Error("Error sending message");
        }
    },
    getMessages: async (conversation_id) => {
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
            Key: {
                message_id: message_id,
            },
        };
        try {
            await dynamodb.delete(params).promise();
            return { message: "Message deleted successfully" };
        } catch (error) {
            console.error("Error deleting message:", error);
            throw new Error("Error deleting message");
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
            return { message: "Message updated successfully" };
        } catch (error) {
            console.error("Error updating message:", error);
            throw new Error("Error updating message");
        }
    },
    getMessageById: async (message_id) => {
        const params = {
            TableName: tableName,
            Key: {
                message_id: message_id,
            },
        };
        try {
            const data = await dynamodb.get(params).promise();
            return data.Item;
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
    
}

module.exports = MessageModel;