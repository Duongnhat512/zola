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

async function cleanupUnreadCount() {
    try {
        console.log('Finding unread_count keys...');
        const keys = await redisClient.keys('unread_count*');

        if (keys.length === 0) {
            console.log('No matching keys found');
            process.exit(0);
        }

        console.log(`Found ${keys.length} keys to delete:`);
        console.log(keys);

        const deleted = await redisClient.del(keys);
        console.log(`Successfully deleted ${deleted} keys`);

        // Close the Redis connection
        await redisClient.quit();
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning Redis keys:', error);
        process.exit(1);
    }
}

// Clean up uncount 
const cleanupUnread = async () => {
    try {
        const keys = await redisClient.keys('unread*');
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log('Đã xóa unread_count khỏi Redis khi restart app.');
        }
    } catch (err) {
        console.error('Lỗi khi xóa unread_count khỏi Redis:', err);
    }
}

module.exports = {
    cleanUpRedis,
    cleanupUnreadCount,
    cleanupUnread
};