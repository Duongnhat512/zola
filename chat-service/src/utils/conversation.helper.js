const generateConversationId = (user1Id, user2Id) => {
  const sortedIds = [user1Id, user2Id].sort();
  return `conv_${sortedIds[0]}_${sortedIds[1]}`;
}

// Lấy danh sách thành viên và quyền
const getMembersAndPermissions = async (conversationIds, redisClient, UserCacheService) => {
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
const getLastMessages = async (conversations, MessageModel) => {
  return Promise.all(
    conversations.map(c =>
      c.last_message_id ? MessageModel.getMessageById(c.last_message_id) : Promise.resolve(null)
    )
  );
}

// Lấy profile bạn bè cho hội thoại private
const getFriendProfiles = async (conversations, permissionsList, user_id, UserCacheService, token) => {
  const permissionsMap = new Map();
  permissionsList.forEach(permissions => {
    permissions.forEach(p => {
      if (p.user_id !== user_id) {
        const convId = generateConversationId(user_id, p.user_id);
        permissionsMap.set(convId, p);
      }
    });
  });

  const privateConversations = conversations.filter(conv => conv.type === "private");
  
  const resultMap = new Map();
  
  const profilePromises = privateConversations.map(async (conversation) => {
    const receiver = permissionsMap.get(conversation.id);
    if (receiver) {
      try {
        const profile = await UserCacheService.getUserProfile(receiver.user_id, token);
        resultMap.set(conversation.id, profile);
      } catch (error) {
        console.error(`Error fetching profile for user ${receiver.user_id}:`, error);
        resultMap.set(conversation.id, null);
      }
    }
  });

  await Promise.all(profilePromises);

  return conversations.map(conv => 
    conv.type === "private" ? resultMap.get(conv.id) || null : null
  );
};

const getUnreadCounts = async (user_id, conversationIds, redisClient) => {
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