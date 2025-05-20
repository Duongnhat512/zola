import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useSocket } from '../context/SocketContext';

export const useSocketFriendEvents = ({
  userId,
  fetchFriendRequests,
  fetchSentRequests,
  fetchFriendsList,
}: {
  userId: string;
  fetchFriendRequests: () => void;
  fetchSentRequests: () => void;
  fetchFriendsList: () => void;
}) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !userId) return;

    // Ai đó gửi lời mời kết bạn cho mình
    socket.on('new_friend_request', (data) => {
      console.log('📥 Có lời mời kết bạn mới:', data);
      Alert.alert('🔔 Thông báo', 'Bạn có một lời mời kết bạn mới');
      fetchFriendRequests();
    });

    // Người ta chấp nhận lời mời mình đã gửi
    socket.on('friend_request_accepted_notify', (data) => {
      console.log('✅ Lời mời được chấp nhận:', data);
      Alert.alert('👍 Đã chấp nhận', 'Lời mời kết bạn của bạn đã được chấp nhận');
      fetchFriendsList();
      fetchSentRequests();
    });

    // Người ta từ chối lời mời của mình
    socket.on('friend_request_rejected', (data) => {
      console.log('❌ Bị từ chối:', data);
      Alert.alert('❌ Từ chối', 'Lời mời kết bạn đã bị từ chối');
      fetchSentRequests();
    });

    // Người kia thu hồi lời mời bạn đang nhận
    socket.on('friend_request_deleted_notify', (data) => {
      console.log('🗑️ Lời mời đã bị thu hồi:', data);
      fetchFriendRequests();
    });

    // Người kia unfriend mình
    socket.on('friend_deleted_notify', (data) => {
      console.log('👋 Bị hủy kết bạn:', data);
      Alert.alert('👋 Hủy kết bạn', 'Một người đã hủy kết bạn với bạn');
      fetchFriendsList();
    });

    return () => {
      socket.off('new_friend_request');
      socket.off('friend_request_accepted_notify');
      socket.off('friend_request_rejected');
      socket.off('friend_request_deleted_notify');
      socket.off('friend_deleted_notify');
    };
  }, [socket, userId]);
};
