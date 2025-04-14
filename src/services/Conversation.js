import axios from "../utils/customize-axios";

export const getConversation = async (id) => {
  try {
    const response = await axios.get(`/chat-service/conversations`, {
      user_id: id,
    });
    return response;
  } catch (error) {
    console.error("Failed to get conversation", error);
    throw error;
  }
};

export const getAllConversationById = async (id) => {
  try {
    const response = await axios.get(
      `/chat-service/conversations/get-conversations?user_id=${id}`
    );
    console.log("====================================");
    console.log(response);
    console.log("====================================");
    return response;
  } catch (error) {
    console.error("Failed to get all conversation by ID", error);
    throw error;
  }
};

export const getAllMemberByConversationId = async (id) => {
  try {
    const response = await axios.get(
      `/chat-service/conversations/get-all-user-in-conversation?conversation_id=${id}`
    );
    return response;
  } catch (error) {
    console.error("Failed to get all members by conversation ID", error);
    throw error;
  }
};
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
