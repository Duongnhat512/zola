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
    const response = await axios.post("/friend-service/friends/request", {
      user_id: userId,
      user_friend_id: friendId,
    });
    return response;
  } catch (error) {
    console.error(
      "Failed to create friend request",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getReceivedFriendRequests = async (userId) => {
  try {
    const response = await axios.get(
      `/friend-service/friends/sentRequests/${userId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to get sent friend requests", error);
    throw error;
  }
};

export const acceptFriendRequest = async (userId, friendId) => {
  try {
    const response = await axios.put(
      "/friend-service/friends/accept",
      {
        user_id: userId,
        user_friend_id: friendId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error(
      "Failed to accept friend request",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getListFriend = async (userId) => {
  try {
    const response = await axios.get(
      `/friend-service/friends/listFriend/${userId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to get friend list", error);
    throw error;
  }
};

export const rejectFriendRequest = async (userId, friendId) => {
  try {
    const response = await axios.put(
      `/friend-service/friends/reject?user_id=${userId}&user_friend_id=${friendId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to reject friend request", error);
    throw error;
  }
};

export const getRequestByUserIdAndUserFriendId = async (userId, friendId) => {
  try {
    const response = await axios.get(
      `/friend-service/friends/getRequestByUserIdAndUserFriendId?user_id=${userId}&user_friend_id=${friendId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to get friend request", error);
    throw error;
  }
}

export const cancelFriendRequest = async (userId, friendId) => {
  try {
    const response = await axios.delete(
      `/friend-service/friends/deleteRequest?user_id=${userId}&user_friend_id=${friendId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to cancel friend request", error);
    throw error;
  }
}
export const deleteFriend = async (userId, friendId) => {
  try {
    const response = await axios.delete(
      `/friend-service/friends/deleteFriend?user_id=${userId}&user_friend_id=${friendId}`
    );
    return response;
  } catch (error) {
    console.error("Failed to cancel friend request", error);
    throw error;
  }
}
export const getFriendByPhoneAndName = async (userId, search) => {
  try {
    const response = await axios.get(
      `/friend-service/friends/getFriendByPhoneAndName?user_id=${userId}&search=${search}`
    );
    return response;
  } catch (error) {
    console.error("Failed to get friend by phone and name", error);
    throw error;
  }
}