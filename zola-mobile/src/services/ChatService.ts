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


export const deleteMessage = async (messageId) => {
  try {
    const res = await axios.put(`/chat-service/messages/delete-message?message_id=${messageId}`);
    if (res.status==="success") {
      console.log("Xóa tin nhắn thành công:", res.data);
      return res.data;
    } else {
      console.error("Failed to delete message:", res.data);
    }
  } catch (error) {
    console.error("Lỗi khi gọi API xóa tin nhắn:", error);
    throw error;
  }
}

