import axios from "../utils/customize-axios";



export const getConversation = async (id) => {
  console.log("Fetching conversation for user ID:", id);
  try {
    const response = await axios.get(`/chat-service/conversations/get-conversations?user_id=${id}`);

    return response;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
}

export const getMessages = async (conversationId) => {
  try {
    const res = await axios.get(`/chat-service/messages/get-conversation-messages/${conversationId}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API lấy tin nhắn:", error);
    throw error;
  }
};

