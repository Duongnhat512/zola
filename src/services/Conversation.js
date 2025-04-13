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

