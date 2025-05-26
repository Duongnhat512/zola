import { getConversation } from './ChatService';
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
export const getConversationById = async (conversationId) => {
  try {
    const response = await axios.get(
      `/chat-service/conversations/get-conversation-by-id?conversation_id=${conversationId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to get conversation by ID", error+ " " + conversationId);
    throw error;
  }
}


export const checkIsGroup = async (conversationId) => {
  try {
    const response = await axios.get(
      `/chat-service/conversations/check-is-group/${conversationId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to check if conversation is a group", error);
    throw error;
  }
}