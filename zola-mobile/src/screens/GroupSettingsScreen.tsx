import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,Alert, Image, TextInput, Modal, FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { sendFriendRequest, getFriendRequests, getSentFriendRequests, getListFriends,acceptFriendRequest,rejectFriendRequest} from '../services/FriendService';
import {GetUserById} from '../services/UserService';
import * as ImageManipulator from 'expo-image-manipulator';

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
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedNewOwner, setSelectedNewOwner] = useState(null);
  const [memberDetails, setMemberDetails] = useState([]);
  console.log(avatar);
  const [permissions, setPermissions] = useState(""); // 'owner', 'member'
  const [modalVisible, setModalVisible] = useState(false);
  const getMyPermission = (conversation) => {
    if (!conversation || !conversation.list_user_id) return null;
   
    const member = conversation.list_user_id.find(
      (item) => item.user_id === user.id
    );
    console.log(member.permission);
    return member ? member.permission : null;
  };
  const handleNameUpdate = (data) => {
    console.log("✅ Tên nhóm đã cập nhật:", data.name);
    Alert.alert("Thành công", data.message || "Tên nhóm đã được cập nhật.");
    navigation.navigate("Main");
  };
  const handleAvatarUpdate = (data) => {
    console.log("✅ anh nhóm đã cập nhật:");
    Alert.alert("Thành công", data.message || "Tên nhóm đã được cập nhật.");
    navigation.navigate("Main");
  };
  //loaddata
  useEffect(() => {
    fetchFriendsWithDetails();
    fetchMemberDetails();
    setPermissions(getMyPermission(conversation));
    socket.on("update_name_group", handleNameUpdate);
    socket.on("update_avt_group",handleAvatarUpdate)
    socket.on("delete_group",()=>{console.log("delete group thanh cong!");
    navigation.navigate("Main");
    });
    socket.on("remove_member", ({ user_id }) => {
      console.log("delete member thanh cong!", user_id);
    
      // Cập nhật danh sách member để xoá user bị đá
      setMemberDetails(prev => prev.filter(m => m.user_id !== user_id));
    
      // Nếu chính mình bị đá thì rời khỏi màn hình
      if (user_id === user.id) {
        Alert.alert("Thông báo", "Bạn đã bị xoá khỏi nhóm.");
        navigation.navigate("Main");
      }
    });     
    socket.on("user_removed", ({ removed_user_id }) => {
      console.log("Ai đó bị kick:", removed_user_id);
      setMemberDetails(prev => prev.filter(m => m.user_id !== removed_user_id));
    });
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
        socket.off("delete_group");
        socket.off("user_removed");

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
    const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
  
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
      const manipulated = await ImageManipulator.manipulateAsync(
        image.uri,
        [], // không cần resize nếu bạn giữ nguyên kích thước
        { base64: true }
      );
      const cleanBase64 = manipulated.base64;
       console.log(cleanBase64);
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
  const handleKickMember = (userId) => {
    console.log(userId);
    socket.emit("remove_member", {
      conversation_id: conversation.conversation_id,
      user_id: userId,
    });
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xoá thành viên này khỏi nhóm?",
      [
        { text: "Huỷ" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: () => {
          
          },
        },
      ]
    );
  };
  
  const fetchMemberDetails = async () => {
    if (!conversation?.list_user_id) return;
  
    const fetched = await Promise.all(
      conversation.list_user_id.map(async (member) => {
        const userRes = await GetUserById(member.user_id);
        console.log(member.permission);
        return {
          ...member,
          fullname: userRes?.user?.fullname || "Không rõ tên",
          avatar: userRes?.user?.avt || null,
        };
      })
    );
  
    setMemberDetails(fetched);
  };
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
      <Image
  source={{
    uri:
      typeof avatar === 'string'
        ? avatar
        : avatar?.uri || conversation?.avatar || '',
  }}
  style={styles.avatar}
/>
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
        <View style={{ marginTop: 20 }}>
  <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Thành viên nhóm</Text>
  <FlatList
  data={memberDetails}
  keyExtractor={(item) => item.user_id}
  renderItem={({ item }) => (
    <View style={styles.memberRow}>
      <Image
        source={item.avatar ? { uri: item.avatar } : require('../assets/icon.png')}
        style={styles.friendAvatar}
      />
      <Text style={{ flex: 1 }}>{item.fullname}</Text>
      <Text style={[styles.permissionTag, styles[item.permission]]}>
        {item.permission === 'owner'
          ? 'Trưởng nhóm'
          : item.permission === 'member'
          ? 'Thành viên'
          : item.permission === 'moderator'
          ? 'Quản trị viên'
          : item.permission}
      </Text>

      {/* Nút xoá chỉ hiện nếu là owner và không tự xoá chính mình */}
      {permissions === 'owner' && item.user_id !== user.id && (
        <TouchableOpacity
          onPress={() => handleKickMember(item.user_id)}
          style={{ padding: 6 }}
        >
          <Text style={{ color: 'red' }}>Xoá</Text>
        </TouchableOpacity>
      )}
    </View>
  )}
/>
  

  {permissions === 'owner' && (
    <TouchableOpacity onPress={() => setShowTransferModal(true)} style={styles.transferButton}>
      <Text style={styles.transferButtonText}>🔁 Chuyển quyền nhóm trưởng</Text>
    </TouchableOpacity>
  )}
</View>
<Modal visible={showTransferModal} animationType="slide">
  <View style={styles.modal}>
    <Text style={styles.modalTitle}>Chọn người nhận quyền nhóm trưởng</Text>

    <FlatList
      data={memberDetails.filter(m => m.user_id !== user.id)}
      keyExtractor={(item) => item.user_id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.transferItem,
            selectedNewOwner === item.user_id && styles.selectedTransferItem,
          ]}
          onPress={() => setSelectedNewOwner(item.user_id)}
        >
          <Image
            source={item.avatar ? { uri: item.avatar } : require('../assets/icon.png')}
            style={styles.friendAvatar}
          />
          <Text style={{ flex: 1 }}>{item.fullname}</Text>

          <View style={styles.radioCircle}>
            {selectedNewOwner === item.user_id && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>
      )}
    />

    <TouchableOpacity
      onPress={() => {
        if (selectedNewOwner) {
          socket.emit("set_permissions", {
            conversation_id: conversation.conversation_id,
            user_id: selectedNewOwner,
            permissions: "owner",
          });

          socket.emit("set_permissions", {
            conversation_id: conversation.conversation_id,
            user_id: user.id,
            permissions: "member",
          });

          setShowTransferModal(false);
          setSelectedNewOwner(null);
          Alert.alert("✅ Thành công", "Đã chuyển quyền nhóm trưởng.");
        }
      }}
      style={styles.confirmAdd}
    >
      <Text style={styles.confirmAddText}>Xác nhận chuyển quyền</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => setShowTransferModal(false)} style={styles.closeModal}>
      <Text style={styles.closeText}>Đóng</Text>
    </TouchableOpacity>
  </View>
</Modal>

        <TouchableOpacity onPress={leaveGroup} style={styles.leave}>
          <Text style={styles.leaveText}> Rời nhóm</Text>
        </TouchableOpacity>

        {permissions === "owner"&& (
          <TouchableOpacity onPress={deleteGroup} style={styles.delete}>
            <Text style={styles.deleteText}> Giải tán nhóm</Text>
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
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  permissionTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  owner: { color: '#FFD700' },
  member: { color: '#ccc' },
  moderator: { color: '#87CEEB' },
  
  transferButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginTop: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  transferButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  transferItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginVertical: 4,
  },
  selectedTransferItem: {
    borderColor: '#007AFF',
    backgroundColor: '#e6f0ff',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  
});
