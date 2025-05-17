import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  FlatList,
  Alert
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { sendFriendRequest, getFriendRequests, getSentFriendRequests, getListFriends,acceptFriendRequest,rejectFriendRequest} from '../services/FriendService';
import {GetUserById} from '../services/UserService';
import UserModal from '../screens/UserModal';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {GetUserByUserName} from '../services/UserService'
const sampleGroups = [
  { id: 'g1', name: 'Nhóm Game Dev', avatar: 'https://i.pravatar.cc/100?img=5' },
  { id: 'g2', name: 'React Native VN', avatar: 'https://i.pravatar.cc/100?img=12' },
  { id: 'g3', name: 'Team Dự Án', avatar: 'https://i.pravatar.cc/100?img=20' },
];

const FriendScreen = () => {
  const [activeTab, setActiveTab] = useState('friends'); // friends | groups
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchText, setSearchText] = useState('');
      const [modalVisibleFriend, setModalVisibleFriend] = useState(false);
  
  const user = useSelector((state: any) => state.user.user);
{/*Nơi tạo biến lưu data và lấy data*/}
    {/*Data bạn bè*/}
    const [friendRequests, setFriendRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([  { id: '2', name: 'Nguyễn Văn A', date: '01/05', desc: 'Đã gửi lời mời kết bạn.',avatar: 'https://i.pravatar.cc/100?img=20'  },
    ]);
    const [friendsList, setFriendsList] = useState([]);
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
          
              setFriendsList(requestsWithDetails);
            } catch (error) {
                
              console.error('Lỗi khi lấy danh sách lời mời kết bạn:', error);
            }
          };
    {/*Data lời mời kết bạn*/}
      const fetchFriendsRequestWithDetails = async () => {
            try {
              const response = await getFriendRequests(user.id);
              const rawRequests = response;
              const pendingRequests = rawRequests.filter((req) => req.status === "pending");
    
              if(pendingRequests==null)
              {
                return;
              }
              // Duyệt từng item để lấy thông tin user_friend_id
              const requestsWithDetails = await Promise.all(
                pendingRequests.map(async (req) => {
                  const userDetailRes = await GetUserById(req.user_friend_id);
                  console.log(userDetailRes);
                  return {
                    ...req,
                    friendInfo: userDetailRes.user, // {fullname, avatar, phone,...}
                  };
                })
              );
          
              setFriendRequests(requestsWithDetails);
            } catch (error) {
                
              console.error('Lỗi khi lấy danh sách lời mời kết bạn:', error);
            }
          };
    {/*Data lời mời kết bạn đã gửi*/}
      const fetchSendRequestWithDetails = async () => {
            try {
              const response = await getSentFriendRequests(user.id);
              const rawRequests = response;
              const pendingRequests = rawRequests.filter((req) => req.status === "pending");
              if(pendingRequests==null)
              {
                return;
              }
              // Duyệt từng item để lấy thông tin user_friend_id
              const requestsWithDetails = await Promise.all(
                pendingRequests.map(async (req) => {
                  const userDetailRes = await GetUserById(req.user_id);
                  console.log(userDetailRes);
                  return {
                    ...req,
                    friendInfo: userDetailRes.user, // {fullname, avatar, phone,...}
                  };
                })
              );
          
              setSentRequests(requestsWithDetails);
            } catch (error) {
                
              console.error('Lỗi khi lấy danh sách lời mời kết bạn:', error);
            }
          };
    {/*Axios để lấy data*/}
        useEffect(() => {
            //fetchFriendData();
            fetchFriendsWithDetails();
            fetchFriendsRequestWithDetails();
            fetchSendRequestWithDetails();
    
          }, []);
    {/*các hàm xử lý thu hồi đồng ý và từ chối*/}
    {/*Gửi lời mời kết bạn*/}
    const handleSendFriendRequest = async (friend_user_id) => {
            try {
              // user_id = người đang đăng nhập (hardcode ví dụ), bạn có thể lấy từ context hoặc AsyncStorage
              // console.log(friend_user_id);
              // friendsList.forEach(friend => {
              //   console.log(friend.id);
              // });
              const isFriend = friendsList.some(friend => friend.friendInfo.id === friend_user_id);
              console.log(isFriend);
              if (isFriend) {
                console.log("Đã là bạn bè");
                Alert.alert("đã kết bạn với người này");
                setModalVisible(false);
              } else {
                console.log("Chưa kết bạn");
                const res = await sendFriendRequest(friend_user_id,user.id);      
                await fetchSendRequestWithDetails();
                 //alert(res); // hiển thị thông báo thành công
                 Alert.alert("Gửi lời mời kết bạn thành công!");
                 setModalVisible(false);
               } 
              }
              catch (err) {
                console.log(err);
                alert(err.message || 'Gửi lời mời thất bại');
              }
              
         
          };
    {/*tạo nhóm nè*/}
        const handleCreateGroup = () => {
          Alert.alert('Tạo nhóm', 'Chức năng tạo nhóm sẽ được triển khai sau.');
          navigation.navigate("GroupCreate",{friendsList});
        };
    {/*từ chối nè*/}
    const handleRejectRequest = async (user_friend_id: string) => {
    try {
          await rejectFriendRequest(user.id, user_friend_id);
          fetchFriendsRequestWithDetails();
        } 
    catch (error) {
              console.error("Lỗi khi từ chối:", error);
              Alert.alert("Lỗi", "Không thể từ chối lời mời kết bạn.");
        }
    };
    {/*đồng ý nè*/}
      const handleAcceptRequest = async (user_friend_id: string) => {
            try {
              //
              await acceptFriendRequest(user_friend_id,user.id);
              Alert.alert("Thành công", "Đã chấp nhận lời mời kết bạn.");
              // gọi lại fetchFriendRequestsWithDetails để cập nhật danh sách
              fetchFriendsRequestWithDetails();
            } catch (error) {
              console.error("Lỗi khi chấp nhận:", error);
              Alert.alert("Lỗi", "Không thể chấp nhận lời mời kết bạn.");
            }
          };
    {/*thu hồi nè*/}
    const handleUndoRequest = async (user_friend_id: string) => {
            try {
              await rejectFriendRequest(user_friend_id,user.id);
              fetchSendRequestWithDetails();
            } catch (error) {
              console.error("Lỗi khi thu hồi:", error);
              Alert.alert("Lỗi", "Không thể thu hồi lời mời.");
            }
          };
          {/*quản lý search*/}
           const handleSearch = async () => {
                  if (!searchText) {
                    return;
                  }
                  
                  try {
                    const response = await GetUserByUserName(searchText);
                    setModalVisibleFriend(true);
                    setSelectedUser(response.user);
                  } catch (err) {
                      throw err;
                  }
                };
  const renderGroupItem = ({ item }) => (
      <View style={styles.groupItem}>
        <Image source={{ uri: item.avatar }} style={styles.groupAvatar} />
        <Text style={styles.groupName}>{item.name}</Text>
      </View>);
{/*ModalNe*/}
const receivedRequests = [
  { id: '1', name: 'Vtacos', date: '02/05', desc: 'Xin chào, mình biết bạn qua số điện thoại.',avatar: 'https://i.pravatar.cc/100?img=20'  },
];
const FriendRequestModal = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('received');
    {/*Xử lý thu hồi lời mời gửi lời mời từ chối lời mời*/}
  const renderItem = ({ item }) => (
   
    <View style={styles.requestBox}>
    <Image source={{ uri: item.avatar }} style={styles.groupAvatar} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.date}>{item.date} • Tìm kiếm số điện thoại</Text>
      <Text style={styles.desc}>{item.desc}</Text>
      {activeTab === 'received' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.rejectBtn} onPress={()=>{handleRejectRequest(item.friendInfo.id)}}>
            <Text style={{ color: '#333' }}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn}>
            <Text style={{ color: '#007AFF' }}  onPress={()=>{handleAcceptRequest(item.friendInfo.id)}}>Đồng ý</Text>
          </TouchableOpacity>
        </View>
      )}
       {activeTab === 'sent' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.acceptBtn} onPress={()=>{handleUndoRequest(item.friendInfo.id)}}>
            <Text style={{ color: '#007AFF' }}>Thu hồi lời mời</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    
  );
  const data = activeTab === 'received' ? friendRequests :sentRequests;

  return (
    <Modal visible={visible} animationType="slide">
    <View style={styles.container1}>
      {/* Header */}
      <View style={styles.header1}>
        <TouchableOpacity onPress={onClose} style={styles.goBack}>
          <Text style={styles.goBackText}>{'←'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={activeTab === 'received' ? styles.activeTabText : styles.tabText}>Đã nhận</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={activeTab === 'sent' ? styles.activeTabText : styles.tabText}>Đã gửi</Text>
        </TouchableOpacity>
      </View>

      {/* Date */}
      <Text style={styles.dateLabel}>Tháng 05, 2025</Text>

      {/* Danh sách */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 15 }}
      />
    </View>
  </Modal>
  );
};
{/*render friend item*/}
const renderFriendItem = ({ item }) => (
       <TouchableOpacity onPress={() => navigation.navigate('ChatRoom', { chats:{name: item.friendInfo.fullname,type:"private",avatar:item.friendInfo.avt,friend_id:item.friendInfo.id} })}>
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 }}>
      <Image
        source={{ uri: item.friendInfo.avt }}
        style={{ width:52, height: 52, borderRadius: 24, marginRight: 15 }}
      />
      <Text style={{ flex: 1 }}>{item.friendInfo.fullname}</Text>
      <TouchableOpacity style={{ marginHorizontal: 10 }}>
        <Text>📞</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text>🎥</Text>
      </TouchableOpacity>
    </View>
    </TouchableOpacity>
  );
{/*ReturnNe*/}
  return (
    <View style={styles.container}>
      {/* PHẦN TRÊN */}
      <View style={styles.header}>
        {/* Thanh tìm kiếm */}
        {/*Tìm kiếm bạn bè*/}
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#BFE6FC" style={styles.iconLeft} />
          <TextInput
            placeholder="Tìm bạn bè,tin nhắn...."
            placeholderTextColor="#D6F0FC"
            style={styles.input}
            onChangeText={setSearchText}
          />
            <TouchableOpacity onPress={handleSearch}>
                    {/* <Text style={styles.searchButton}>Tìm</Text> */}
                    <FontAwesome name="user-plus" size={20} color="#fff" style={styles.iconRight} />
                  </TouchableOpacity>
       
        </View>

        {/* Tabs */}
        {/*Nút chuyển Tab bạn bè và nhóm*/}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={styles.tabText}>Bạn bè</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'groups' && styles.activeTab]}
            onPress={() => setActiveTab('groups')}
          >
            <Text style={styles.tabText}>Nhóm</Text>
          </TouchableOpacity>
        </View>
          {/* 2 nút row */}
          <TouchableOpacity style={styles.rowButton} onPress={() => setModalVisible(true)}>
          <FontAwesome name="user" size={18} color="#007AFF" style={{ marginRight: 10 }} />
          <Text>Lời mời kết bạn</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rowButton}  onPress={handleCreateGroup}>
          <Feather name="book" size={18} color="#007AFF" style={{ marginRight: 10 }} />
          <Text>Tạo nhóm</Text>
        </TouchableOpacity>
      </View>

      {/* PHẦN DƯỚI */}
      <View style={styles.body}>
        {/* Danh sách nè*/}
        <FlatList
          data={friendsList}
          keyExtractor={(item) => item.id}
          renderItem={renderFriendItem}
          style={{ marginTop: 12 }}
        />
      </View>

      {/* Modal lời mời kết bạn */}
      <FriendRequestModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <UserModal
         visible={modalVisibleFriend}
        user={selectedUser}
         onClose={() => setModalVisibleFriend(false)}
         onSendFriendRequest={handleSendFriendRequest}/>
    </View>
  );
};

export default FriendScreen;
const styles = StyleSheet.create({
  goBackText:
  {
    fontSize:32,color:'#fff'
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',gap:15
  },
  container1: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    paddingTop: 40,
  },
  header: {
    padding: 5,
    backgroundColor: '#fff',
  },
  header1: {
    padding: 5,
    backgroundColor: '#50B6F1',
  },
  searchBar: {
    backgroundColor: '#50B6F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 5,
  },
  iconLeft: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  iconRight: {
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-around',
  },
  tabButton: {
    paddingVertical: 6,
    width: '50%',
    backgroundColor: '#eee',
 
  },
  activeTab: {
    backgroundColor: '#50B6F1',
  },
  tabText: {
    color: '#000',
    fontWeight: '500',
       textAlign:'center'
  },
  groupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  groupName: {
    fontSize: 16,
  },
  body: {
    flex: 1,
    padding: 12,
    paddingTop: 20,
    backgroundColor:'#fff',
    paddingHorizontal: 12,
  },
  rowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  friendItem: {
    paddingVertical: 6,
    paddingLeft: 4,
    fontSize: 16,
  },
  groupHeader: {
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  groupList: {
    // nếu muốn cách đều
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    width: '80%',
    borderRadius: 10,
  },
  containerSearch: {
    backgroundColor: '#50B6F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 5,
  },
    searchContainer: {
      flexDirection: 'row',
      backgroundColor: '#ffffff',
      borderRadius: 20,
      alignItems: 'center',
      margin: 10,
      paddingHorizontal: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchButton: {
      color: '#fff',
      fontWeight: 'bold',
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    topHalf: { flex: 1, borderBottomWidth: 1, borderColor: '#ddd' },
    bottomHalf: { flex: 1, padding: 16 },
    tabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderBottomWidth: 1,
      borderColor: '#ddd',
    },
    tabActive: { borderBottomWidth: 2, borderColor: '#007bff' },
    tabTextActive: { fontWeight: 'bold', color: '#007bff' },
    tabContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    createGroupButton: {
      backgroundColor: '#007bff',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 12,
    },
    createGroupText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    title: {
      fontSize: 18,
      color: '#fff',
      marginLeft: 12,
      fontWeight: 'bold',
    },

    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor:'#fff',
    },
    activeTabText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    dateLabel: {
      padding: 10,
      fontWeight: 'bold',
      color: '#444',
    },
    requestBox: {
      backgroundColor: '#fff',
      padding: 14,
      borderRadius: 8,
      marginBottom: 12,
    },
    name: {
      fontWeight: 'bold',
      fontSize: 15,
      marginBottom: 2,
    },
    date: {
      color: '#777',
      fontSize: 13,
      marginBottom: 6,
    },
    desc: {
      fontSize: 14,
      backgroundColor: '#F2F4F6',
      padding: 10,
      borderRadius: 8,
      marginBottom: 10,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    rejectBtn: {
      backgroundColor: '#eee',
      padding: 10,
      borderRadius: 6,
      flex: 1,
      alignItems: 'center',
      marginRight: 8,
    },
    acceptBtn: {
      backgroundColor: '#e6f0ff',
      padding: 10,
      borderRadius: 6,
      flex: 1,
      alignItems: 'center',
    },
});
