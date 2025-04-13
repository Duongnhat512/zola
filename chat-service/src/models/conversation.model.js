const { dynamodb } = require('../utils/aws.helper');
const { v4: uuidv4 } = require('uuid');

const memberTableName = "conversation_members";
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

    /**
     * 
     * @param {Object} conversation 
     * @returns {Object} conversation
     */
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
                status: conversation.status || "active",
                type: conversation.type || "private",
                avatar: conversation.avatar || "",
                no_of_member: conversation.members ? conversation.members.length : 0,
                is_user_remove: 0
            }
        };
        try {
            await dynamodb.put(params).promise();

            if (conversation.members && conversation.members.length > 0) {
                const memberPromises = conversation.members.map(userId => {
                    return dynamodb.put({
                        TableName: memberTableName,
                        Item: {
                            id: uuidv4(),
                            conversation_id: conversation.id,
                            user_id: userId,
                            // permission: userId === conversation.created_by ? "admin" : "member",
                            created_at: new Date().toISOString(),
                        }
                    }).promise();
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
    },

    /**
     * Tìm conversation giữa 2 user
     * @param {String} user1Id 
     * @param {String} user2Id 
     * @returns 
     */
    findPrivateConversation: async (user1Id, user2Id) => {
        try {
            const user1ConversationsParams = {
                TableName: memberTableName,
                IndexName: "userId-index",
                KeyConditionExpression: "user_id = :userId",
                ExpressionAttributeValues: {
                    ":userId": user1Id
                }
            };

            const user1Conversations = await dynamodb.query(user1ConversationsParams).promise();

            if (!user1Conversations.Items.length) {
                return null;
            }

            for (const memberRecord of user1Conversations.Items) {
                const conversationId = memberRecord.conversation_id;

                const checkUser2Params = {
                    TableName: memberTableName,
                    KeyConditionExpression: "conversation_id = :convId AND user_id = :userId",
                    ExpressionAttributeValues: {
                        ":convId": conversationId,
                        ":userId": user2Id
                    }
                };

                const user2InConv = await dynamodb.query(checkUser2Params).promise();

                if (user2InConv.Items.length > 0) {
                    const convParams = {
                        TableName: tableName,
                        Key: { id: conversationId }
                    };

                    const conversation = await dynamodb.get(convParams).promise();

                    if (conversation.Item &&
                        conversation.Item.type === "private" &&
                        conversation.Item.no_of_member === 2) {
                        return conversation.Item;
                    }
                }
            }

            return null;
        } catch (error) {
            console.error("Lỗi khi tìm kiếm hội thoại:", error);
            throw new Error("Lỗi khi tìm kiếm hội thoại");
        }
    },

    /**
     * Tìm danh sách thành viên có trong hội thoại
     * @param {String} conversationId 
     * @returns {Array} danh sách thành viên
     */
    getConversationMembers: async (conversationId) => {
        const params = {
            TableName: memberTableName,
            IndexName: "id-index",
            KeyConditionExpression: "id = :conversationId",
            ExpressionAttributeValues: {
                ":conversationId": conversationId
            }
        };

        try {
            const result = await dynamodb.query(params).promise();
            return result.Items;
        } catch (error) {
            console.error("Lỗi khi lấy thành viên hội thoại:", error);
            throw new Error("Lỗi khi lấy thành viên hội thoại");
        }
    },

    /**
     * 
     * @param {String} conversationId 
     * @returns 
     */
    getConversationById: async (conversationId) => {
        const params = {
            TableName: tableName,
            Key: {
                id: conversationId
            }
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
                id: conversationId
            },
            UpdateExpression: "set last_message_id = :last_message_id",
            ExpressionAttributeValues: {
                ":last_message_id": lastMessage
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