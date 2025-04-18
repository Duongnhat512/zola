const redisClient = require('../configs/redis.config');

const cleanUpRedis = async () => {
    try {
        const keys = await redisClient.keys('sockets:*');
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log('Đã xóa user khỏi Redis khi restart app.');
        }
    } catch (err) {
        console.error('Lỗi khi xóa user khỏi Redis:', err);
    }
};

module.exports = {
    cleanUpRedis,
};