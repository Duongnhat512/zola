const redis = require("../configs/redis.config");
const axios = require("axios");

const UserCacheService = {
    cacheUserProfile: async (user) => {
        const key = `user:${user.id}`;
        await redis.set(key, JSON.stringify(user), 'EX', 4 * 3600); 
    },

    getUserProfile: async (userId, token) => {
        const key = `user:${userId}`;
        let user = await redis.get(key);

        if (!user) {
            try {
                const response = await axios.get(
                    `${process.env.BASE_URL}/auth-service/me/get-user?id=${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                
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
}

module.exports = UserCacheService;