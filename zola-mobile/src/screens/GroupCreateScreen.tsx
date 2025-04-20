import React, { useState,useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Modal, StyleSheet, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { sendFriendRequest, getFriendRequests, getSentFriendRequests, getListFriends,acceptFriendRequest,rejectFriendRequest} from '../services/FriendService';
import {GetUserById} from '../services/UserService';
import { useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system'; // để đọc ảnh base64
import setupSocket  from '../services/Socket';
const dummyFriends = [
  { id: '1', fullname: 'Hiệp Võ', avatar: { uri: 'https://randomuser.me/api/portraits/men/1.jpg' } },
  { id: '2', fullname: 'Ngô Quốc Đạt', avatar: { uri: 'https://randomuser.me/api/portraits/men/2.jpg' } },
  { id: '3', fullname: 'Khang Đình', avatar: { uri: 'https://randomuser.me/api/portraits/men/3.jpg' } },
  { id: '4', fullname: 'Bảo', avatar: { uri: 'https://randomuser.me/api/portraits/men/4.jpg' } },
  { id: '5', fullname: 'Phạm Minh Châu', avatar: { uri: 'https://randomuser.me/api/portraits/women/5.jpg' } },
];


export default function GroupCreateScreen() {
  const route = useRoute();
  const { friendsList } = route.params;
  const [friendssList, setFriendsList] = useState(friendsList);
  const user = useSelector((state: any) => state.user.user);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [groupName, setGroupName] = useState('');
// socket
const [socket, setSocket] = useState(null);

useEffect(() => {
  let socketInstance;

  const initSocket = async () => {
    socketInstance = await setupSocket();
    setSocket(socketInstance);

    socketInstance.on("group_created", (data) => {
      console.log("🎉 Nhóm tạo thành công:", data);
    });
  };

  initSocket();

  return () => {
    socketInstance?.disconnect();
  };
}, []);










  const toggleSelectFriend = (friend) => {
    const exists = selectedFriends.some(f => f.friendInfo.id === friend.friendInfo.id);
    if (exists) {
      setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const pickGroupImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setGroupAvatar({ uri: result.assets[0].uri });
    }
  };

  const renderFriend = ({ item }) => {
    const isSelected = selectedFriends.some(f => f.friendInfo.id === item.friendInfo.id);
    return (
      <TouchableOpacity style={styles.friendRow} onPress={() => toggleSelectFriend(item)}>
        <Image source={item.friendInfo.avt} style={styles.avatar} />
        <Text style={styles.fullname}>{item.friendInfo.fullname}</Text>
        <View style={[styles.checkbox, isSelected && styles.checked]} />
      </TouchableOpacity>
    );
  };
  const handleCreateGroup = async () => {
    let file_data = null;
    let file_type = null;
    let file_name = null;
  
    if (groupAvatar?.uri) {
      const base64 = await FileSystem.readAsStringAsync(groupAvatar.uri, { encoding: 'base64' });
      file_data = base64;
      file_type = 'image/jpeg'; // hoặc dùng hàm tự động detect cũng được
      file_name = groupAvatar.uri.split('/').pop();
    }
  
    const members = selectedFriends.map(f => f.friendInfo.id);
  
    socket.emit("create_group", {
      name: groupName,
      members,
      file_data,
      file_type,
      file_name,
    });
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.groupImagePicker} onPress={pickGroupImage}>
        {groupAvatar ? (
          <Image source={groupAvatar} style={styles.groupImage} />
        ) : (
          <Text style={styles.addImageText}>Chọn ảnh nhóm</Text>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Nhập tên nhóm"
        style={styles.groupNameInput}
        value={groupName}
        onChangeText={setGroupName}
      />

      <TextInput placeholder="Tìm tên hoặc số điện thoại" style={styles.searchInput} />

      <FlatList
        data={friendssList}
        keyExtractor={(item) => item.friendInfo.id}
        renderItem={renderFriend}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {selectedFriends.length > 0 && (
        <View style={styles.modalBottom}>
          <View style={styles.selectedAvatars}>
            {selectedFriends.map((f) => (
              <Image key={f.friendInfo.id} source={f.friendInfo.avt} style={styles.selectedAvatar} />
            ))}
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() =>handleCreateGroup()}>
            <Text style={styles.createButtonText}>Tạo nhóm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  groupImagePicker: {
    alignSelf: 'center',
    marginBottom: 8
  },
  groupImage: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  addImageText: {
    fontSize: 16,
    color: '#999'
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10
  },
  fullname: {
    flex: 1,
    fontSize: 16
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc'
  },
  checked: {
    backgroundColor: '#3498db',
    borderColor: '#3498db'
  },
  modalBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectedAvatars: {
    flexDirection: 'row',
    flex: 1
  },
  selectedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
