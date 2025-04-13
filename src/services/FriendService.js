import axios from "../utils/customize-axios";

export const getFriendList = async (userId) => {
  try {
    const response = await axios.get(`/friend-service/friends/${userId}`);
    return response;
  } catch (error) {
    console.error("Failed to get friend list", error);
    throw error;
  }
};
export const getRequestFriend = async (userId) => {
  try {
    const response = await axios.get(
      `/friend-service/friends/requests/${userId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to get friend list", error);
    throw error;
  }
};
export const createFriendRequest = async (userId, friendId) => {
  try {
    const response = await axios.post(
      `/friend-service/friends/request?user_id=${userId}&user_friend_id=${friendId}`
    );

    console.log("====================================");
    console.log(response);
    console.log("====================================");

    return response;
  } catch (error) {
    console.error(
      "Failed to create friend request",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getSendFriendRequests = async (userId) => {
  try {
    const response = await axios.get(
      `/friend-service/friends/requests/sentRequests/${userId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to get sent friend requests", error);
    throw error;
  }
};
