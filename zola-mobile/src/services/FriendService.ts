
import axios from "../utils/customize-axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Lấy danh sách lời mời kết bạn
export const getFriendRequests = async (userId) => {
  const res = await axios.get(`friend-service/friends/requests/${userId}`);
  console.log(res);
  return res.data;
};
// Gửi yêu cầu chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (user_id: string, user_friend_id: string) => {
  console.log("user_id"+user_id);
  console.log("user_friend_id"+user_friend_id);
    const response = await axios.put("friend-service/friends/accept", {
      user_id,
      user_friend_id,
    });
    console.log(response);
    return response;
  };
  
  // Gửi yêu cầu từ chối lời mời kết bạn
  export const rejectFriendRequest = async (user_id: string, user_friend_id: string) => {
    const response = await axios.put("friend-service/friends/reject", null, {
      params: {
        user_id,
        user_friend_id,
      },
    });
    console.log(response);
    return response;
  };
  
// Lấy danh sách lời mời đã gửi
export const getSentFriendRequests = async (userId) => {
  const res = await axios.get(`friend-service/friends/sentRequests/${userId}`);
  console.log(res);
  return res.data;
};

// Lấy danh sách bạn bè
export const getListFriends = async (userId) => {
  const res = await axios.get(`friend-service/friends/listFriend/${userId}`);
  console.log(res);
  return res.data;
};
export const sendFriendRequest = async (user_id, user_friend_id) => {
  try {
    const res = await axios.post('friend-service/friends/request', {
      user_id,
      user_friend_id,
    });
    console.log(res);
    return res;
  } catch (error) {
    throw error.response?.data || { message: 'Gửi lời mời thất bại' };
  }
};