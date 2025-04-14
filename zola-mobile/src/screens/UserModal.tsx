import React from 'react';
import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';

const UserModal = ({ visible, user, onClose, onSendFriendRequest }) => {
  if (!user) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 300, padding: 20, backgroundColor: '#fff', borderRadius: 10 }}>
          <Image
            source={{ uri: user.avt }}
            style={{ width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 10 }}
          />
          <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>{user.fullname}</Text>
          <Text style={{ textAlign: 'center', color: '#555', marginTop: 5 }}>SĐT: {user.phone}</Text>
          <Text style={{ textAlign: 'center', color: '#555' }}>Ngày sinh: {user.dob}</Text>
          <Text style={{ textAlign: 'center', color: '#555' }}>Giới tính: {user.gender}</Text>

          <TouchableOpacity
            style={{ marginTop: 15, backgroundColor: '#007bff', padding: 10, borderRadius: 5 }}
            onPress={onSendFriendRequest}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>Gửi lời mời kết bạn</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={{ marginTop: 10 }}>
            <Text style={{ color: '#007bff', textAlign: 'center' }}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UserModal;
