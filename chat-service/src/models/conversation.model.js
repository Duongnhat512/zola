const { dynamodb } = require('../utils/aws.helper');
const { v4: uuidv4 } = require('uuid');

const tableName = "conversations";

const ConversationModel = {
    getConversations: async (userId) => {
        const params = {
            TableName: tableName,
            IndexName: "created-by-index",
            KeyConditionExpression: "created_by = :user_id",
            ExpressionAttributeValues: {
                ":user_id": userId
            }
        };
        try {
            const result = await dynamodb.query(params).promise();
            return result.Items;
        }
        catch (error) {
            console.error("Có lỗi khi lấy danh sách hội thoại:", error);
            throw new Error("Có lỗi khi lấy danh sách hội thoại");
        }
    },

    createConversation: async (conversation) => {
        conversation.id = uuidv4();
        const params = {
            TableName: tableName,
            Item: {
                id: conversation.id,
                created_by: conversation.created_by,
                name: conversation.name,
                description: conversation.description,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_activity: new Date().toISOString(),
                status: conversation.status,
                type: conversation.type,
                avatar: conversation.avatar,
            }
        };
        try {
            await dynamodb.put(params).promise();
            return conversation;
        } catch (error) {
            console.error("Có lỗi khi tạo hội thoại:", error);
            throw new Error("Có lỗi khi tạo hội thoại");
        }
    },

    deleteConversation: async (conversationId) => {
        const params = {
            TableName: tableName,
            Key: {
                id: conversationId
            }
        };
        try {
            await dynamodb.delete(params).promise();
            return { message: "Hội thoại đã được xóa thành công" };
        } catch (error) {
            console.error("Có lỗi khi xóa hội thoại:", error);
            throw new Error("Có lỗi khi xóa hội thoại");
        }
    },

    updateConversation: async (conversationId, conversation) => {
        const params = {
            TableName: tableName,
            Key: {
                id: conversationId
            },
            UpdateExpression: "set #name = :name, #description = :description",
            ExpressionAttributeNames: {
                "#name": "name",
                "#description": "description"
            },
            ExpressionAttributeValues: {
                ":name": conversation.name,
                ":description": conversation.description
            },
            ReturnValues: "UPDATED_NEW"
        };
        try {
            const result = await dynamodb.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error("Có lỗi khi cập nhật hội thoại:", error);
            throw new Error("Có lỗi khi cập nhật hội thoại");
        }
    }

};

module.exports = ConversationModel;