import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { sendFriendRequest, getFriendRequests, getSentFriendRequests, getListFriends,acceptFriendRequest,rejectFriendRequest} from '../services/FriendService';
import {GetUserById} from '../services/UserService';
import * as ImageManipulator from 'expo-image-manipulator';
import Feather from 'react-native-vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from "../context/SocketContext";
export default function ForwardScreen() {
  const [selected, setSelected] = useState<string[]>([]);
    const route = useRoute();
    const { message,conversations} = route.params || {};
    const socket = useSocket();
    const navigation = useNavigation();
  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
const handleForward = () => {
  if (selected.length === 0) {
    Alert.alert("Thông báo", "Bạn chưa chọn nơi chuyển tiếp.");
    return;
  }

  const payload = {
    message_id: message.id, // bạn chắc chắn param `message` có trường `id`
    to_conversation_ids: selected,
  };

  socket.emit("forward_message", payload);

  socket.once("message_forwarded", (res) => {
    if (res.status === "success") {
      Alert.alert("Thành công", "Đã chuyển tiếp tin nhắn", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  });

  socket.once("error", (err) => {
    Alert.alert("Lỗi", err.message || "Có lỗi xảy ra khi chuyển tiếp");
  });
};
  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selected.includes(item.conversation_id);
    return (
      <TouchableOpacity style={styles.item} onPress={() => {
        toggleSelect(item.conversation_id)}}>
        <View style={styles.info}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <Text>{item.name}</Text>
        </View>
        <View style={[styles.circle, isSelected && styles.circleSelected]} />
      </TouchableOpacity>
    );
  };

  const selectedAvatars = conversations.filter(d => selected.includes(d.conversation_id));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chia sẻ</Text>

      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={item => item.conversation_id}
      />

      <View style={styles.footer}>
        <View style={styles.selectedAvatars}>
          {selectedAvatars.map(item => (
            <Image
              key={item.conversation_id}
              source={{ uri: item.avatar }}
              style={styles.selectedAvatar}
            />
          ))}
        </View>
        <Text  style={styles.input}>{message.text||null}</Text>
      <TouchableOpacity onPress={handleForward}>
        <Ionicons name="send" size={24} color="#2196f3" />
      </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  info: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  circleSelected: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAvatars: { flexDirection: 'row' },
  selectedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    marginHorizontal: 8,
  },
});
