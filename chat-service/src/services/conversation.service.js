const redisClient = require("../configs/redis.config");
const ConversationModel = require("../models/conversation.model");
const {cleanupUnread, cleanupUnreadCount} = require("../utils/redis.helper");

const createNewPrivateConversation = async (sender_id, receiver_id) => {
    try {
        conversation = await ConversationModel.createConversation({
            created_by: sender_id,
            type: "private",
            members: [sender_id, receiver_id],
        });

        await Promise.all([
            redisClient.sadd(`group:${conversation.id}`, sender_id),
            redisClient.sadd(`group:${conversation.id}`, receiver_id),
        ]);
        return conversation;
    } catch (error) {
        console.error('Error creating new private conversation:', error);
        throw error;
    }
}

const updateConversationMetadata = async (conversationId, messageId, senderId) => {
    const timestamp = Date.now();

    const members = await redisClient.smembers(`group:${conversationId}`);

    await Promise.all([
        ConversationModel.updateLastMessage(conversationId, messageId),
        ...members.map(memberId =>
            redisClient.zadd(`chatlist:${memberId}`, timestamp, conversationId)
        )
    ]);

    return members;
}

const getUnreadCount = async (user_id, conversation_id) => {
    try {
        const key = `unread_count:${user_id}:${conversation_id}`;
        const count = await redisClient.get(key)

        return count ? parseInt(count) : 0;
    } catch (error) {
        console.error("Có lỗi khi lấy số lượng hội thoại chưa đọc:", error);
        return 0;
    }
}

const increaseUnreadCount = async (conversation_id, exceptUserId = null) => {
    try {
        const members = await redisClient.smembers(`group:${conversation_id}`);

        await Promise.all(members.map(async (member) => {
            if (member === exceptUserId) {
                return;
            }

            const key = `unread_count:${member}:${conversation_id}`;
            await Promise.all([
                redisClient.incr(key),
                redisClient.sadd(`unread:${member}`, conversation_id)
            ]);
        }));
    } catch (error) {
        console.error("Có lỗi khi tăng số lượng hội thoại chưa đọc:", error);
    }
}

const resetUnreadCount = async (user_id, conversation_id) => {
    try {
        const key = `unread_count:${user_id}:${conversation_id}`;
        await Promise.all([
            redisClient.set(key, 0),
            redisClient.srem(`unread:${user_id}`, conversation_id)
        ]);
    } catch (error) {
        console.error("Có lỗi khi đặt lại số tin nhắn chưa đọc:", error);
    }
}

const clearUnread = async (socket, data) => {
    await cleanupUnread();
    await cleanupUnreadCount();
}

module.exports = {
    createNewPrivateConversation,
    updateConversationMetadata,
    getUnreadCount,
    increaseUnreadCount,
    resetUnreadCount,
    clearUnread
};