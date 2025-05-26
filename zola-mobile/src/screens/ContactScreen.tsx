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
import { useSocket } from "../context/SocketContext";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { sendFriendRequest, getFriendRequests, getSentFriendRequests, getListFriends,acceptFriendRequest,rejectFriendRequest} from '../services/FriendService';
import {GetUserById} from '../services/UserService';
import UserModal from '../screens/UserModal';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {GetUserByUserName} from '../services/UserService'
import { Socket } from 'socket.io-client';
import { getPrivateConversation } from '../services/ConversationService';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useSocketFriendEvents } from '../hook/useSocketFriendEvents';


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
  const [conversation,setConversation]= useState(null);
  const user = useSelector((state: any) => state.user.user);
  const socket = useSocket();
  const [chats, setChats] = useState([]);






const handleFindConversation = async (userId, friend) => {
  console.log("Finding conversation for user:", userId, "and friend:", friend);
  try {
    const response = await getPrivateConversation(userId, friend.id);
    console.log("Private conversation response:", response);

    if (response.status === "success") {
      let chatToNavigate;

      if (response.newConversation) {
        console.log("newConversation:", response.newConversation);
        const newChat = {
          conversation_id: response.newConversation.id,
          list_user_id: response.newConversation.members,
          list_message: [],
          avatar: response.newConversation.avatar,
          name: friend.fullname,
          created_by: response.newConversation.created_by,
          unread_count: 0,
          is_unread: false,
        };
        setChats(newChat);
        setConversation(prev => [...prev, newChat]);
        chatToNavigate = newChat;
      } else {
        console.log("Conversation:", response.conversation);
        const updatedConversation = {
          ...response.conversation,
          name: friend.fullname,
          avatar: friend.avt,
        };
        setChats(updatedConversation);
        setConversation(prev => [...prev, updatedConversation]);
        chatToNavigate = updatedConversation;
      }
      console.log("Navigating to ChatRoom with chat:", chatToNavigate);
      navigation.navigate("ChatRoom", {
        chats: chatToNavigate,
        conversations: conversation, // nếu muốn chính xác luôn, bạn cũng có thể truyền [...conversation, chatToNavigate]
      });
    } else {
      console.error("Error fetching conversation:", response.message);
    }
  } catch (error) {
    console.error("Error fetching conversation:", error);
  }
};






 useEffect(() => {
      socket.on("conversations", (response) => {
          if (response.status === "success") {
            setConversation(response.conversations);
            console.log("🗨️ Danh sách hội thoại:", response.conversations);
          } else {
            console.error("Lỗi khi lấy danh sách hội thoại:", response.message);
          }
        });
    return () => {
      

      };
  }, []);
  useEffect(() => {
     const timeout = setTimeout(() => {
        socket.emit("get_conversations", { user_id: user.id });
      }, 500); 

      return () => clearTimeout(timeout);
  }, [socket]);
  useEffect(() => {
  return () => {
    socket.off("friend_request_sent");
    socket.off("friend_request_error");
    socket.off("friend_request_deleted");
    socket.off("friend_request_accepted");
    socket.off("friend_request_accept_error");
    socket.off("friend_request_rejected");
    socket.off("error");
  };
}, []);
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
    const isFriend = friendsList.some(friend => friend.friendInfo.id === friend_user_id);
    if (isFriend) {
      Alert.alert("Đã kết bạn với người này");
      setModalVisible(false);
      return;
    }

    socket.emit("send_friend_request", {
      user_id:friend_user_id ,
      user_friend_id: user.id
    });

    socket.once("friend_request_sent", () => {
      Alert.alert("Đã gửi lời mời kết bạn!");
      fetchSendRequestWithDetails(); // cập nhật lại danh sách
      setModalVisible(false);
    });

    socket.once("friend_request_error", (err) => {
      Alert.alert("Lỗi", err.message || "Không thể gửi lời mời.");
    });
  } catch (err) {
    console.error(err);
    Alert.alert("Lỗi không xác định");
  }
};
    {/*tạo nhóm nè*/}
        const handleCreateGroup = () => {
          navigation.navigate("GroupCreate",{friendsList});
        };
    {/*từ chối nè*/}
   const handleRejectRequest = async (user_friend_id: string) => {
  socket.emit("reject_friend_request", {
    user_id:user_friend_id,
    user_friend_id:user.id
  });

  socket.once("friend_request_rejected", () => {
    fetchFriendsRequestWithDetails(); // cập nhật danh sách lời mời
  });

  socket.once("error", (err) => {
    Alert.alert("Lỗi", err.message || "Không thể từ chối.");
  });
};

    {/*đồng ý nè*/}
      const handleAcceptRequest = async (user_friend_id: string) => {
  socket.emit("accept_friend_request", {
    user_id: user.id,
    user_friend_id: user_friend_id
  });

  socket.once("friend_request_accepted", () => {
    Alert.alert("Thành công", "Đã chấp nhận lời mời.");
    fetchFriendsRequestWithDetails();
    fetchFriendsWithDetails(); // cập nhật danh sách bạn bè
  });

  socket.once("friend_request_accept_error", (err) => {
    Alert.alert("Lỗi", err.message || "Không thể chấp nhận.");
  });
};

    {/*thu hồi nè*/}
          const handleUndoRequest = async (user_friend_id: string) => {
  socket.emit("cancel_friend_request", {
    user_id: user.id,
    user_friend_id: user_friend_id
  });

  socket.once("friend_request_deleted", () => {
    fetchSendRequestWithDetails(); // cập nhật lại danh sách
  });

  socket.once("error", (err) => {
    Alert.alert("Lỗi", err.message || "Không thể thu hồi.");
  });
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
  useSocketFriendEvents({
  userId: user.id,
  fetchFriendRequests: fetchFriendsRequestWithDetails,
  fetchSentRequests: fetchSendRequestWithDetails,
  fetchFriendsList: fetchFriendsWithDetails,
  });

  
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
      <View style={{flexDirection:'row'}}>
      <Image source={{ uri: item.friendInfo.avt }} style={styles.groupAvatar} />
      <Text style={styles.name}>{item.friendInfo.fullname}</Text>
      </View>    
      <Text style={styles.date}>{item.date} • Tìm kiếm số điện thoại</Text>
      {/* <Text style={styles.desc}>{item.desc}</Text> */}
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
 
  dayjs.extend(relativeTime);
  dayjs.locale('vi');
  
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    return dayjs(timestamp).fromNow(); // ví dụ: "5 phút trước"
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
    onPress={() => navigation.navigate('ChatRoom', { chats: item })}
    >
      <View style={styles.chatItem}>
        <Image
          source={{
            uri: item.avatar || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
          }}
          style={styles.avatar}
        />
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>
            {item.name || 'Người dùng không xác định'}
          </Text>
          <View style={styles.chatMessageRow}>
            <Text
              style={styles.chatMessage}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.last_message?.type === 'text'
                ? item.last_message?.message
                : item.last_message?.type === 'image'
                ? 'Đã gửi một ảnh'
                : item.last_message?.type === 'video'
                ? 'Đã gửi một video'
                : item.last_message?.type === 'document'
                ? 'Đã gửi một tệp'
                : 'Chưa có tin nhắn'}
            </Text>
            <Text style={styles.chatTime}>
              {formatRelativeTime(item.last_message?.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
const renderFriendItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleFindConversation(user.id, item.friendInfo)}>
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderColor: "#eee" }}>
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
          <Feather name="search" size={18} color="#BFE6FC" style={styles.iconLeft} />
          <TextInput
            placeholder="Tìm bạn bè....."
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
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>Bạn bè</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'groups' && styles.activeTab]}
            onPress={() => setActiveTab('groups')}
          >
            <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>Nhóm</Text>
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
        { activeTab==='groups'&&
        (<FlatList
          data={conversation.filter(chat => chat.type === 'group')}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          style={{ marginTop: 12 }}
        />)
        }
         { activeTab==='friends'&&
        (<FlatList
          data={friendsList}
          keyExtractor={(item) => item.id}
          renderItem={renderFriendItem}
          style={{ marginTop: 12 }}
        />)
        }
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
    backgroundColor: '#fff',
  },
  header1: {
    padding: 5,
    backgroundColor: '#006AF5',
  },
  searchBar: {
    backgroundColor: '#006AF5',
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    },
  iconLeft: {
    marginRight: 8,
    marginLeft:15
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    fontWeight:500,
  },
  iconRight: {
    marginLeft: 8,
    marginRight:15
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
    backgroundColor: '#006AF5',
    color:'#ffffff',
  },
  tabText: {
    color: '#000',
    fontWeight: '500',
       textAlign:'center'
  },
   activeTabText: {
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
    backgroundColor: '#006AF5',
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
     chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chatMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
});
