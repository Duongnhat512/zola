import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useState,useEffect  } from 'react';

import {GetUserById} from '../services/UserService';
export default function PrivateChatSettingsScreen({ navigation  }) {
  const route = useRoute();
  const { friendProfile } = route.params || {};
  const [friend,setFriend] = useState({});
  if (!friendProfile) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy thông tin người dùng.</Text>
      </View>
    );
  }

  const handleBlockUser = () => {
    Alert.alert('Đã chặn người dùng', `${friendProfile.fullname} đã bị chặn.`);
  };

  const handleReportUser = () => {
    Alert.alert('Đã báo cáo', `Bạn đã báo cáo ${friendProfile.fullname}.`);
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
        //fetchFriendData();
       // const data = GetUserById(friendProfile);
       // setFriend(data);
     //  Alert.alert(friendProfile);
      }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Image
        source={{ uri: friendProfile.avt }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{friendProfile.fullname}</Text>
      <Text style={styles.phone}>{friendProfile.phone || 'Không có số điện thoại'}</Text>

      <View style={styles.options}>
        <TouchableOpacity onPress={handleBlockUser} style={styles.optionButton}>
          <Text style={styles.optionText}>🚫 Chặn người này</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleReportUser} style={styles.optionButton}>
          <Text style={styles.optionText}>⚠️ Báo cáo người này</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLeaveChat} style={styles.leaveButton}>
          <Text style={styles.leaveText}>🗑 Xoá đoạn chat</Text>
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
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
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
