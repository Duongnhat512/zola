import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import styles from '../styles/MessagesScreen.styles';
import { useSelector } from 'react-redux';
import setupSocket from '../services/Socket';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { showMessage } from "react-native-flash-message";

const MessagesScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const [activeTab, setActiveTab] = useState('priority');
  const [chats, setChats] = useState([]);
  const [socket, setSocket] = useState(null);
  
  dayjs.extend(relativeTime);
  dayjs.locale('vi');
  
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    return dayjs(timestamp).fromNow(); // ví dụ: "5 phút trước"
  };

  useFocusEffect(
    useCallback(() => {
      if (socket && user?.id) {
        socket.emit("get_conversations", { user_id: user.id });
      }
    }, [socket, user])
  );

  
  useEffect(() => {
    let socketInstance;
  
    const initSocket = async () => {
      try {
 
        
        socketInstance = await setupSocket();
        setSocket(socketInstance);
  
        socketInstance.on("new_group", (data) => {
          showMessage({
            message: "Bạn đã được thêm vào nhóm"+data.group_name,
            description: data.group_name,
            type: "success",
          });
          navigation.navigate("Main");
        });
        socketInstance.on("group_deleted", (data) => {
          showMessage({
            message: "Nhóm"+data.group_name+"đã bị giải tán",
            type: "danger",
          });
          navigation.navigate("Main");
        });  
        // socketInstance.on("update_permissions", (data) => {
        //   showMessage({
        //     message: "⚙️ Quyền trong nhóm đã được cập nhật",
        //     type: "default",
        //   });
        //   navigation.navigate("Main");
        // });
      
        socketInstance.on("connect", () => {
          console.log("✅ Socket connected:", socketInstance.id);
        });
  
        socketInstance.on("connect_error", (err) => {
          console.error("❌ Socket connection error:", err);
        });
  
        socketInstance.on("conversations", (response) => {
          if (response.status === "success") {
            setChats(response.conversations);
            console.log("🗨️ Danh sách hội thoại:", response.conversations);
          } else {
            console.error("Lỗi khi lấy danh sách hội thoại:", response.message);
          }
        });
  
      } catch (err) {
        console.error("Lỗi khởi tạo socket:", err);
      }
    };
  
    initSocket();
  
    return () => {
      if (socketInstance) {
        socketInstance.off("conversations");
        socketInstance.off("new_group");
        // socketInstance.off("new_member");
        // socketInstance.off("removed_member");
        socketInstance.off("group_deleted");
        // socketInstance.off("user_left_group");
        // socketInstance.off("update_permissions");
        socketInstance.disconnect();
      }
      if (socketInstance) {
        socketInstance.off("conversations");
        socketInstance.disconnect();
      }
    };
  }, []);
  
  
  useEffect(() => {
    if (socket && user?.id) {
      const timeout = setTimeout(() => {
        socket.emit("get_conversations", { user_id: user.id });
      }, 500); 
  
      return () => clearTimeout(timeout);
    }
  }, [socket, user]);

  const renderChatItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ChatRoom', { chats: item })}>
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
  
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Image
            source={require('../assets/zalo-icon/search.png')}
            style={styles.icon2}
          />
          <Text style={{ color: '#FFFFFF', fontSize: 15 }}>Tìm kiếm</Text>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="qr-code-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'priority' && styles.activeTab]}
          onPress={() => setActiveTab('priority')}
        >
          <Text style={[styles.tabText, activeTab === 'priority' && styles.activeTabText]}>
            Ưu tiên
          </Text>
          {activeTab === 'priority' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'other' && styles.activeTab]}
          onPress={() => setActiveTab('other')}
        >
          <Text style={[styles.tabText, activeTab === 'other' && styles.activeTabText]}>
            Khác
          </Text>
        </TouchableOpacity>

        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
      />
    </SafeAreaView>
  );
};

export default MessagesScreen;
