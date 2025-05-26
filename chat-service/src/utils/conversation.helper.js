const generateConversationId = (user1Id, user2Id) => {
  const sortedIds = [user1Id, user2Id].sort();
  return `conv_${sortedIds[0]}_${sortedIds[1]}`;
}

// Lấy danh sách thành viên và quyền
const getMembersAndPermissions = async (conversationIds, redisClient, UserCacheService) => {
  const pipeline = redisClient.pipeline();
  conversationIds.forEach(id => {
    pipeline.smembers(`group:${id}`);
  });
  const memberResults = await pipeline.exec();

  const permissionKeys = [];
  const membersByConv = {};

  conversationIds.forEach((convId, index) => {
    const members = memberResults[index][1] || [];
    membersByConv[convId] = members;

    members.forEach(memberId => {
      permissionKeys.push({ userId: memberId, convId, key: `conversation_permisstion:${convId}:${memberId}` });
    });
  });

  const permissionPipeline = redisClient.pipeline();
  permissionKeys.forEach(({ key }) => {
    permissionPipeline.get(key);
  });
  const permissionResults = await permissionPipeline.exec();

  const permissionMap = new Map();
  permissionKeys.forEach(({ userId, convId }, index) => {
    const permission = permissionResults[index][1] || 'member';
    permissionMap.set(`${userId}:${convId}`, permission);
  });

  return conversationIds.map(convId => {
    const members = membersByConv[convId] || [];
    return members.map(memberId => ({
      user_id: memberId,
      permission: permissionMap.get(`${memberId}:${convId}`) || 'member',
      conversationId: convId
    }));
  });
}

const getLastMessages = async (conversations, MessageModel) => {
  const messageIds = conversations
    .filter(c => c.last_message_id)
    .map(c => c.last_message_id);
    
  if (messageIds.length === 0) return conversations.map(() => null);
  
  const messages = await MessageModel.getMessagesByIds(messageIds);
  const messageMap = new Map(messages.map(m => [m.id, m]));
  
  return conversations.map(c => 
    c.last_message_id ? messageMap.get(c.last_message_id) || null : null
  );
}

// Lấy profile bạn bè cho hội thoại private
const getFriendProfiles = async (conversations, permissionsList, user_id, UserCacheService, token) => {
  const profilePromises = conversations.map(async (conversation, index) => {
    if (conversation.type !== "private") return null;

    const permissions = permissionsList[index] || [];
    const receiver = permissions.find(p => p.user_id !== user_id);

    if (!receiver) return null;

    try {
      return await UserCacheService.getUserProfile(receiver.user_id, token);
    } catch (error) {
      console.error(`Error fetching profile for user ${receiver.user_id}:`, error);
      return null;
    }
  });

  return Promise.all(profilePromises);
};

const getUnreadCounts = async (user_id, conversationIds, redisClient) => {
  const pipeline = redisClient.pipeline();
  conversationIds.forEach(conversationId => {
    const key = `unread_count:${user_id}:${conversationId}`;
    pipeline.get(key);
  });
  
  const results = await pipeline.exec();
  return results.map(([err, count]) => count ? parseInt(count) : 0);
}

const getConversationsByIdsOrdered = async (conversationIds, ConversationModel) => {
  const conversations = await ConversationModel.getConversationsByIds(conversationIds);
  const conversationMap = new Map(conversations.map(conv => [conv.id, conv]));

  return conversationIds.map(id => conversationMap.get(id)).filter(Boolean);
};

module.exports = {
  generateConversationId,
  getMembersAndPermissions,
  getLastMessages,
  getFriendProfiles,
  getUnreadCounts,
  getConversationsByIdsOrdered // thêm helper mới
};