import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { sendFriendRequest, getFriendRequests, getSentFriendRequests, getListFriends,acceptFriendRequest,rejectFriendRequest} from '../services/FriendService';
import * as ImageManipulator from 'expo-image-manipulator';
import Feather from 'react-native-vector-icons/Feather';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useState,useEffect  } from 'react';

import {GetUserById} from '../services/UserService';
export default function PrivateChatSettingsScreen({ navigation  }) {
  const route = useRoute();
  const { conversation, socket, currentUserId } = route.params || {};
  const [friend,setFriend] = useState({});
  const user = useSelector((state: any) => state.user.user);
  const [friendList, setFriendList] = useState([]);
  const [memberDetails, setMemberDetails] = useState({fullname:'',phone:''});
  const [selectedFriends, setSelectedFriends] = useState([]);
  if (!conversation) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy thông tin người dùng.</Text>
      </View>
    );
  }
  const fetchMemberDetails = async () => {
  let userId = null;
  console.log('conversation.list_user_id', conversation.list_user_id);
  if (Array.isArray(conversation.list_user_id)) {
    if (typeof conversation.list_user_id[0] === "string") {
      userId = conversation.list_user_id.find(id => id !== currentUserId);
    } else {
      const otherUser = conversation.list_user_id.find(user => user.user_id !== currentUserId);
      userId = otherUser?.user_id;
    }
  } 

  const fetched = await GetUserById(userId);
  setMemberDetails(fetched?.user);
};
  const handleBlockUser = () => {
    Alert.alert('Đã chặn người dùng', `${memberDetails.fullname||'lp'} đã bị chặn.`);
  };

  const handleReportUser = () => {
    Alert.alert('Đã báo cáo', `Bạn đã báo cáo ${memberDetails.fullname||'ko'}.`);
  };

  const handleLeaveChat = () => {
    Alert.alert('Xác nhận', 'Bạn có muốn xoá đoạn chat này không?', [
      { text: 'Huỷ' },
      {
        text: 'Xoá',
        onPress: () => navigation.navigate('Main'),
        style: 'destructive',
      },
    ]);
  };
  useEffect(() => {
    fetchMemberDetails();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Image
        source={{ uri: memberDetails.avt }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{memberDetails.fullname||'khong co ten'}</Text>
      <Text style={styles.phone}>{memberDetails.username || 'Không có số điện thoại'}</Text>

      <View style={styles.options}>
        <TouchableOpacity onPress={handleBlockUser} style={styles.optionButton}>
          <View style={{flexDirection:'row'}}> 
        <Feather name="alert-circle" size={20} color="#ff"  style={{marginRight:10}} />           
        <Text style={styles.optionText}> Chặn người này</Text>
          </View>
     
        </TouchableOpacity>

        <TouchableOpacity onPress={handleReportUser} style={styles.optionButton}>
              <View style={{flexDirection:'row'}}> 
        <Feather name="flag" size={20} color="#ff" style={{marginRight:10}} />           
          <Text style={styles.optionText}>Báo cáo người này</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLeaveChat} style={styles.optionButton}>
                   <View style={{flexDirection:'row'}}> 
        <Feather name="trash" size={20} color="#ff" style={{marginRight:10}}  />           
         <Text style={styles.leaveText}>Xoá đoạn chat</Text>
          </View>  
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { fontSize: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12,backgroundColor:'#000000' },
  name: { fontSize: 20, fontWeight: 'bold' },
  phone: { fontSize: 16, color: '#666', marginBottom: 20 },
  options: { width: '100%', marginTop: 20 },
  optionButton: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  optionText: { fontSize: 16 },
  leaveButton: { padding: 12, marginTop: 30, alignItems: 'center' },
  leaveText: { color: '#FF3B30', fontWeight: 'bold' },
});
