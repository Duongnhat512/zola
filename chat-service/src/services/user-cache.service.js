const redis = require("../configs/redis.config");
const axios = require("axios");
const ConversationModel = require("../models/conversation.model");

const UserCacheService = {
    cacheUserProfile: async (user) => {
        const key = `user:${user.id}`;
        await redis.set(key, JSON.stringify(user), 'EX', 4 * 3600); 
    },

    getUserProfile: async (userId, token) => {
        const key = `user:${userId}`;
        let user = await redis.get(key);

        console.log('====================================');
        console.log('User from Redis:', user);
        console.log('====================================');
        if (!user) {
            console.log('====================================');
            console.log(token);
            console.log('====================================');
            try {
                const response = await axios.get(
                    `${process.env.BASE_URL}/auth-service/me/get-user?id=${userId}`,
                    {
                        headers: {
                            Authorization: `${token}`,
                        },
                    }
                );

                console.log('====================================');
                console.log("aaaaaa" +response);
                console.log('====================================');
                
                if (response.data && response.data.user) {
                    user = JSON.stringify(response.data.user);
                    await redis.set(key, userData, 'EX', 4 * 3600);
                } else {
                    console.error("Invalid response format:", response);
                }
            } catch (error) {
                console.error("Error fetching user data:", error.message);
            }
        }

        return user ? JSON.parse(user) : null;
    }, 

    deleteUserProfile: async (userId) => {
        const key = `user:${userId}`;
        await redis.del(key);
    },

    setConversationPermissions: async (userId, conversationId, permissions) => {
        const key = `conversation_permisstion:${conversationId}:${userId}`;
        await redis.set(key, permissions);
    },

    getConversationPermissions: async (userId, conversationId) => {
        const key = `conversation_permisstion:${conversationId}:${userId}`;
        let permissions = await redis.get(key);

        if (!permissions) {
            permissions = await ConversationModel.getPermissions(userId, conversationId);
        }

        return permissions;
    },

    removePermissions: async (userId, conversationId) => {
        const key = `conversation_permisstion:${conversationId}:${userId}`;
        await redis.del(key);
    },

    muteMember: async (userId, conversationId) => {
        const key = `conversation_mute:${conversationId}:${userId}`;
        await redis.set(key, true);
    },

    getMuteMember: async (userId, conversationId) => {
        const key = `conversation_mute:${conversationId}:${userId}`;
        let mute = await redis.get(key);

        if (!mute) {
            mute = await ConversationModel.getMuteMember(userId, conversationId);
        }

        return mute;
    },
}

module.exports = UserCacheService;