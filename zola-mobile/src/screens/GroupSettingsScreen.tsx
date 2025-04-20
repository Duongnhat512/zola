import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,Alert, Image, TextInput, Modal, FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import mime from "mime-types";
import { sendFriendRequest, getFriendRequests, getSentFriendRequests, getListFriends,acceptFriendRequest,rejectFriendRequest} from '../services/FriendService';
import {GetUserById} from '../services/UserService';
export default function GroupSettingsScreen({ navigation  }) {
    const route = useRoute();
    const user = useSelector((state: any) => state.user.user);
    const [friendList, setFriendList] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const { conversation, socket, currentUserId } = route.params || {};
    console.log(conversation);
    if (!conversation) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Không tìm thấy dữ liệu nhóm.</Text>
          </View>
        );
      }
      // get friend
    const fetchFriendsWithDetails = async () => {
        try {
          const response = await getListFriends(user.id);
          const rawRequests = response;
          if(rawRequests==null)
            {
              return;
            }
          // Duyệt từng item để lấy thông tin user_friend_id
          const requestsWithDetails = await Promise.all(
            rawRequests.map(async (req) => {
              const userDetailRes = await GetUserById(req.user_friend_id);
              console.log(userDetailRes);
              return {
                ...req,
                friendInfo: userDetailRes.user, // {fullname, avatar, phone,...}
              };
            })
          );
        
          setFriendList(requestsWithDetails);
          console.log(requestsWithDetails);
        } catch (error) {
            
          console.error('Lỗi khi lấy danh sách lời mời kết bạn:', error);
        }
      };


  const [groupName, setGroupName] = useState(conversation.name);
  const [avatar, setAvatar] = useState(conversation.avatar);
  const [permissions, setPermissions] = useState(""); // 'owner', 'member'
  const [modalVisible, setModalVisible] = useState(false);
  const handleNameUpdate = (data) => {
    console.log("✅ Tên nhóm đã cập nhật:", data.name);
    Alert.alert("Thành công", data.message || "Tên nhóm đã được cập nhật.");
  };
  const handleAvatarUpdate = (data) => {
    console.log("✅ anh nhóm đã cập nhật:");
    Alert.alert("Thành công", data.message || "Tên nhóm đã được cập nhật.");
  };
  useEffect(() => {
    fetchFriendsWithDetails();
    socket.on("update_name_group", handleNameUpdate);
    socket.on("update_avt_group",handleAvatarUpdate)
    socket.on("error", (err) => {
        console.log("❌ Lỗi socket:", err.message);
        Alert.alert("Lỗi", err.message);
      });
      socket.emit("get_permission", {
        conversation_id: conversation.conversation_id,
        user_id: user.id, // <-- CHÍNH XÁC PHẢI GỬI user.id
      });
  const handlePermission = ({ permission }) => {
    console.log("✅ Permission của mình là:", permission);
    setPermissions(permission);
  };

  socket.on("your_permission", handlePermission);
    const handleOutGroup = (data) => {
        console.log("🚪 Rời nhóm:", data.message);
        // Ví dụ: quay lại màn hình danh sách chat
        navigation.navigate("Main");
        // Hoặc điều hướng về Home:
        // navigation.navigate("ChatListScreen");
      };
    
    socket.on("out_group", handleOutGroup);
    return () => {
        socket.off("out_group", handleOutGroup);
        socket.off("your_permission");
        socket.off("update_name_group", handleNameUpdate);
        socket.off("update_name_group");
        socket.off("update_avt_group");
      };
  }, []);
  const getMimeType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      default:
        return 'application/octet-stream'; // fallback
    }
  };
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true });
  
    if (!result.canceled) {
      const image = result.assets[0];
      setAvatar(image); // Cập nhật UI nếu có
    
      const fileName = image.fileName || image.uri.split('/').pop();
      const fileType = getMimeType(image.fileName);
      //const fileType = image.type || `image/${fileName.split('.').pop()}`;
      const ext = fileName.split('.').pop();
      //const fileType = mime.lookup(ext);
      console.log(fileName);
      console.log(fileType);
    //  console.log(image);
      console.log(conversation.conversation_id);
     // console.log(image.base64);
      console.log(image.fileSize);
      console.log(image.uri);
      const cleanBase64 = image.base64.replace(/^data:image\/\w+;base64,/, "");
      socket.emit("update_group_avt", {
        conversation_id: conversation.conversation_id, // truyền đúng ID nhóm nha
        file_name: fileName,
        file_type: fileType,
        file_data: cleanBase64,
        file_size: image.fileSize || image.uri.length, // optional
      });
    }
  };
  

  const updateGroupName = () => {
    console.log("update name"+groupName);
    console.log(conversation.conversation_id);
    socket.emit("update_group_name", {
      conversation_id: conversation.conversation_id,
      name: groupName,
    });
  };
  const updateGroupAvt = ()=>
  {

  }
  const openAddMemberModal = () => {
        const notInGroup = friendList.filter(
          friend => !conversation.list_user_id.includes(friend.friendInfo.id)
        );
        console.log(notInGroup);
        setFriendList(notInGroup);
        setModalVisible(true);
  };

  const handleAddMember = (userId) => {
    socket.emit("add_member", {
      conversation_id: conversation.conversation_id,
      user_id: userId,
    });
  };

  const leaveGroup = () => {
    socket.emit("out_group", { conversation_id: conversation.conversation_id });
  };

  const deleteGroup = () => {
    socket.emit("delete_conversation", { conversation_id: conversation.conversation_id });
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
    <Text style={styles.backText}>←</Text>
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Tùy chọn nhóm</Text>
</View>

      <TouchableOpacity onPress={pickImage}>
        <Image source={avatar?.uri ? { uri: avatar.uri } : require('../assets/icon.png')} style={styles.avatar} />
      </TouchableOpacity>

      <TextInput
        value={groupName}
        onChangeText={setGroupName}
        onBlur={updateGroupName}
        style={styles.nameInput}
      />

      <View style={styles.options}>
        <TouchableOpacity onPress={openAddMemberModal} style={styles.option}>
          <Text>➕ Thêm thành viên</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={leaveGroup} style={styles.leave}>
          <Text style={styles.leaveText}>🚪 Rời nhóm</Text>
        </TouchableOpacity>

        {user.id === conversation.create && (
          <TouchableOpacity onPress={deleteGroup} style={styles.delete}>
            <Text style={styles.deleteText}>💥 Giải tán nhóm</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide">
  <View style={styles.modal}>
    <Text style={styles.modalTitle}>Chọn bạn để thêm vào nhóm</Text>

    <FlatList
      data={friendList}
      keyExtractor={(item) => item.friendInfo.id}
      renderItem={({ item }) => {
        const isSelected = selectedFriends.some(f => f.friendInfo.id === item.friendInfo.id);
        return (
          <View style={styles.friendItem}>
            <Image source={{ uri: item.friendInfo.avt }} style={styles.friendAvatar} />
            <Text style={styles.friendName}>{item.friendInfo.fullname}</Text>
            <TouchableOpacity
              onPress={() => {
                if (isSelected) {
                  setSelectedFriends(prev => prev.filter(f => f.friendInfo.id !== item.friendInfo.id));
                } else {
                  setSelectedFriends(prev => [...prev, item]);
                }
              }}
              style={[styles.selectButton, isSelected && styles.selectedButton]}
            >
              <Text style={styles.selectText}>
                {isSelected ? '✓ Đã chọn' : 'Chọn'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }}
    />

    <TouchableOpacity
      onPress={() => {
        selectedFriends.forEach(friend => {
            console.log("Socket:", socket);
console.log("Selected friends:", selectedFriends);
console.log("Emit add_member:", {
    conversation_id: conversation.conversation_id,
    user_id: friend.friendInfo.id,
  });
          socket.emit("add_member", {
            conversation_id: conversation.conversation_id,
            user_id: friend.friendInfo.id,
          });
        });
        setSelectedFriends([]);
        setModalVisible(false);
      }}
      style={styles.confirmAdd}
    >
      <Text style={styles.confirmAddText}>➕ Thêm thành viên</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeModal}>
      <Text style={styles.closeText}>Đóng</Text>
    </TouchableOpacity>
  </View>
</Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  avatar: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center' },
  nameInput: { fontSize: 18, textAlign: 'center', marginVertical: 16 },
  options: { marginTop: 24 },
  option: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  leave: { padding: 12, marginTop: 30 },
  leaveText: { color: "#FF9500", fontWeight: "bold" },
  delete: { padding: 12 },
  deleteText: { color: "#FF3B30", fontWeight: "bold" },
  modal: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  closeModal: { padding: 16, backgroundColor: "#ccc", marginTop: 20, alignItems: 'center' },
  closeText: { fontWeight: "bold" },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
backButton: { padding: 8 },
backText: { fontSize: 24 },
headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendName: {
    flex: 1,
    fontSize: 16,
  },
  selectButton: {
    backgroundColor: '#ddd',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  selectedButton: {
    backgroundColor: '#4CD964',
  },
  selectText: {
    fontWeight: 'bold',
    color: 'white',
  },
  confirmAdd: {
    backgroundColor: '#007AFF',
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  confirmAddText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
});
