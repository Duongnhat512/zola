const generateConversationId = (user1Id, user2Id) => {
  const sortedIds = [user1Id, user2Id].sort();
  return `conv_${sortedIds[0]}_${sortedIds[1]}`;
}

// Lấy danh sách thành viên và quyền
const getMembersAndPermissions = async(conversationIds, redisClient, UserCacheService) => {
  return Promise.all(
    conversationIds.map(async (id) => {
      const members = await redisClient.smembers(`group:${id}`);
      return Promise.all(
        members.map(async (memberId) => {
          const permission = await UserCacheService.getConversationPermissions(memberId, id);
          return { user_id: memberId, permission };
        })
      );
    })
  );
}

// Lấy last messages
const getLastMessages = async(conversations, MessageModel) => {
  return Promise.all(
    conversations.map(c =>
      c.last_message_id ? MessageModel.getMessageById(c.last_message_id) : Promise.resolve(null)
    )
  );
}

// Lấy profile bạn bè cho hội thoại private
const getFriendProfiles = async(conversations, permissionsList, user_id, UserCacheService, token) => {
  return Promise.all(
    conversations.map((conversation, idx) => {
      if (conversation.type === "private") {
        const list_user_id = permissionsList[idx];
        const receiver = list_user_id.find(u => u.user_id !== user_id);
        if (receiver) {
          return UserCacheService.getUserProfile(receiver.user_id, token);
        }
      }
      return Promise.resolve(null);
    })
  );
}

const getUnreadCounts = async(user_id, conversationIds, redisClient) => {
  return Promise.all(
    conversationIds.map(async (conversationId) => {
      const key = `unread_count:${user_id}:${conversationId}`;
      const count = await redisClient.get(key);
      return count ? parseInt(count) : 0;
    })
  );
}

module.exports = {
  generateConversationId,
  getMembersAndPermissions,
  getLastMessages,
  getFriendProfiles,
  getUnreadCounts
};