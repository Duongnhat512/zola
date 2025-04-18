const generateConversationId = (user1Id, user2Id) => {
  const sortedIds = [user1Id, user2Id].sort();
  return `conv_${sortedIds[0]}_${sortedIds[1]}`;
}

module.exports = {
  generateConversationId,
};