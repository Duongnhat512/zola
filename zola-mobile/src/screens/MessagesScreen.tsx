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
import { getConversation } from '../services/ChatService';
import { getUserById } from '../services/UserService';

const MessagesScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const [activeTab, setActiveTab] = useState('priority');
  const [chats, setChats] = useState([]);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await getConversation(user.id);
      if (response.status === 'success') {
        fetchUserDetails(response.all_members);
      } else {
        console.error("Lỗi khi lấy danh sách hội thoại:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  const fetchUserDetails = async (chatList) => {
    try {
      const updatedChats = await Promise.all(
        chatList.map(async (chat) => {
          // Lọc user khác với user hiện tại
          const otherUserId = chat.list_user_id.find(id => id !== user.id);
          const response = await getUserById(otherUserId);
          if (response.status === 'success') {
            setOtherUser(response.user);
            return {
              ...chat,
              user: response.user,
            };
          }
          
          return chat;
        })
      );
      
      setChats(updatedChats);
      console.log("Danh sách hội thoại:", updatedChats);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ChatRoom', { conversationId: item.conversation_id,ortherUser: item.user })}>
      <View style={styles.chatItem}>
        <Image
          source={{
            uri: item.user?.avt || 'https://via.placeholder.com/100x100.png?text=No+Avatar',
          }}
          style={styles.avatar}
        />
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>
            {item.user?.fullname || 'Chưa đặt tên'}
          </Text>
          <Text style={styles.chatMessage}>
            Nhấn để bắt đầu trò chuyện
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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

      {/* Tabs */}
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

      {/* Danh sách chat */}
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
