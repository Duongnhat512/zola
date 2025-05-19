import axios from "../utils/customize-axios";
export const getPrivateConversation = async (userId, friendId) => {
  try {
    const response = await axios.get(
      `/chat-service/conversations/get-private-conversation?user_id=${userId}&friend_id=${friendId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to get private conversation", error);
    throw error;
  }
};