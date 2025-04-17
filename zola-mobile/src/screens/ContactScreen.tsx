import React, { useState,useEffect  } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity,TextInput,Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import {GetUserByUserName} from '../services/UserService'
import Icon from 'react-native-vector-icons/Feather';
import { sendFriendRequest, getFriendRequests, getSentFriendRequests, getListFriends,acceptFriendRequest,rejectFriendRequest} from '../services/FriendService';
import {GetUserById} from '../services/UserService';
import UserModal from '../screens/UserModal';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const Tabs = ['Bạn bè', 'Lời mời kết bạn','Lời mời kết bạn đã gửi'];
const ContactScreen = () => {
    const navigation = useNavigation();
      const user = useSelector((state: any) => state.user.user);
    const [friendRequests, setFriendRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const sampleGroups = [
      { id: 'g1', name: 'Nhóm Game Dev', avatar: 'https://i.pravatar.cc/100?img=5' },
      { id: 'g2', name: 'React Native VN', avatar: 'https://i.pravatar.cc/100?img=12' },
      { id: 'g3', name: 'Team Dự Án', avatar: 'https://i.pravatar.cc/100?img=20' },
    ];
    const handleCreateGroup = () => {
      Alert.alert('Tạo nhóm', 'Chức năng tạo nhóm sẽ được triển khai sau.');
      navigation.navigate("GroupCreate");
    };
  
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
      
      // Hàm xử lý từ chối
      const handleRejectRequest = async (user_friend_id: string) => {
        try {
          await rejectFriendRequest(user.id, user_friend_id);
          fetchFriendsRequestWithDetails();
        } catch (error) {
          console.error("Lỗi khi từ chối:", error);
          Alert.alert("Lỗi", "Không thể từ chối lời mời kết bạn.");
        }
      };
      // hàm thu hồi lời mời kết bạn
      const handleUndoRequest = async (user_friend_id: string) => {
        try {
          await rejectFriendRequest(user_friend_id,user.id);
          fetchSendRequestWithDetails();
        } catch (error) {
          console.error("Lỗi khi thu hồi:", error);
          Alert.alert("Lỗi", "Không thể thu hồi lời mời.");
        }
      };
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
    const fetchFriendData = async () => {
        try {
          const [req, sent, friends] = await Promise.all([
            getFriendRequests(user.id),
            getSentFriendRequests(user.id),
            getListFriends(user.id),
          ]);
    
          //setFriendRequests(req.data);
          setSentRequests(sent.data);
          setFriendsList(friends.data);
        } catch (error) {
          console.error('Lỗi khi lấy dữ liệu bạn bè:', error);
        }
      };
    
      useEffect(() => {
        //fetchFriendData();
        fetchFriendsWithDetails();
        fetchFriendsRequestWithDetails();
        fetchSendRequestWithDetails();

      }, []);







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
      
    const handleSearch = async () => {
        if (!searchText) {
          return;
        }
        
        try {
          const response = await GetUserByUserName(searchText);
          setModalVisible(true);
          setSelectedUser(response.user);
        } catch (err) {
            throw err;
        }
      };
    
    const [activeTab, setActiveTab] = useState('Bạn bè');
    const renderGroupItem = ({ item }) => (
      <View style={styles.groupItem}>
        <Image source={{ uri: item.avatar }} style={styles.groupAvatar} />
        <Text style={styles.groupName}>{item.name}</Text>
      </View>);
    const renderFriendItem = ({ item }) => (
      <TouchableOpacity>
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 }}>
      <Image
        source={{ uri: item.friendInfo.avt }}
        style={{ width: 48, height: 48, borderRadius: 24, marginRight: 15 }}
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
  const renderFriendRequest = ({ item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 }}>
      <Image
        source={{ uri: item.friendInfo.avt }}
        style={{ width: 48, height: 48, borderRadius: 24, marginRight: 15 }}
      />
      <Text style={{ flex: 1 }}>{item.friendInfo.fullname}</Text>
      <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={()=>{handleRejectRequest(item.friendInfo.id)}}>
        <Text>Từ chối</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginHorizontal: 10 }}  onPress={()=>{handleAcceptRequest(item.friendInfo.id)}}>
        <Text>Đồng ý kết bạn</Text>
      </TouchableOpacity>
    </View>
  );
  const renderFriendRequested = ({ item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 }}>
      <Image
        source={{ uri: item.friendInfo.avt }}
        style={{ width: 48, height: 48, borderRadius: 24, marginRight: 15 }}
      />
      <Text style={{ flex: 1 }}>{item.friendInfo.fullname}</Text>
      <TouchableOpacity style={{ marginHorizontal: 10 }}  onPress={()=>{handleUndoRequest(item.friendInfo.id)}}>
        <Text>Thu hồi</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>  
      {/* Tabs Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderColor: '#ddd' }}>
        {Tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{ paddingVertical: 10, borderBottomWidth: activeTab === tab ? 2 : 0, borderColor: '#007bff' }}
          >
            <Text style={{ fontWeight: activeTab === tab ? 'bold' : 'normal' }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.topHalf}>
 {/* Friends List */}
 {activeTab === 'Bạn bè' && (
    <View style={{gap:40}}>    
    <View style={{ flex: 1, paddingTop: 40 }}>
      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>    
        <Icon name="search" size={18} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Tìm theo số điện thoại"
          keyboardType="phone-pad"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Text style={styles.searchButton}>Tìm</Text>
        </TouchableOpacity>
      </View>
      </View>
        <FlatList
          data={friendsList}
          keyExtractor={item => item.friendInfo.id}
          renderItem={renderFriendItem}
        />

        <UserModal
         visible={modalVisible}
        user={selectedUser}
         onClose={() => setModalVisible(false)}
         onSendFriendRequest={handleSendFriendRequest}/>

        </View>
      )}
      {activeTab === 'Lời mời kết bạn' && (
        <View style={{ padding: 20 }}>
          <Text style={{ color: 'gray' }}>Chưa có nhóm nào.</Text>
          <FlatList
          data={friendRequests}
          keyExtractor={item => item.friendInfo.id}
          renderItem={renderFriendRequest}
        />
        </View>
      )}
          {activeTab === 'Lời mời kết bạn đã gửi' && (
        <View style={{ padding: 20 }}>   
          <Text style={{ color: 'gray' }}>Chưa có nhóm nào.</Text>
          <FlatList
          data={sentRequests}
          keyExtractor={item => item.friendInfo.id}
          renderItem={renderFriendRequested}
        />
        </View>    
      )}    
      </View>
      <View style={styles.bottomHalf}>
      <View style={styles.groupHeader}>
          <TouchableOpacity onPress={handleCreateGroup}>
            <Text>Tạo nhóm</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={sampleGroups}
          keyExtractor={item => item.id}
          renderItem={renderGroupItem}
          contentContainerStyle={styles.groupList}
        />
      </View>   

     
      
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
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
    input: {
      flex: 1,
      fontSize: 15,
      color: '#333',
    },
    searchButton: {
      color: '#007bff',
      fontWeight: 'bold',
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    friendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderColor: '#eee',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    container: { flex: 1, backgroundColor: '#fff' },
    topHalf: { flex: 1, borderBottomWidth: 1, borderColor: '#ddd' },
    bottomHalf: { flex: 1, padding: 16 },
    tabs: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderBottomWidth: 1,
      borderColor: '#ddd',
    },
    tabButton: { paddingVertical: 10 },
    tabActive: { borderBottomWidth: 2, borderColor: '#007bff' },
    tabText: { color: '#333' },
    tabTextActive: { fontWeight: 'bold', color: '#007bff' },
    tabContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
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
    groupAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    groupName: {
      fontSize: 16,
    },
  });
  
export default ContactScreen;