import React, { useEffect, useState , useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  Alert,
  StyleSheet,
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
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { qrLogin } from '../services/UserService';
import {checkIsGroup}  from '../services/ConversationService';
const MessagesScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);
  const [activeTab, setActiveTab] = useState('priority');
  const [chats, setChats] = useState([]);
  const [socket, setSocket] = useState(null);
  const latestChats = useRef([]);
  
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
            message: "Bạn đã được thêm vào nhóm" + " " + data.group_name,
            description: "",
            type: "success",
          });
          navigation.navigate("Main");
        });
        socketInstance.on("group_deleted", (data) => {
          showMessage({
            message: "Nhóm " + data.group_name + " đã bị giải tán",
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
            latestChats.current = response.conversations;
          } else {
            console.error("Lỗi khi lấy danh sách hội thoại:", response.message);
          }
        });

         const loadConversations = () => {
             socketInstance.emit('get_conversations');
          };
        socketInstance.on('new_message', async (data) => {
              console.log("Nhận được tin nhắn mới:", data);
                try {
                  const res = await checkIsGroup(data.conversation_id);
                  const resConversation = res.conversation;
                  let prefix = '';
                  if (resConversation) {
                    prefix = resConversation.type === 'group'
                      ? `${resConversation.name} (Nhóm)  `
                      : `${data.sender_name} (Riêng tư) `;
                  }
                  const isText = data.type === "text" && !data.is_deleted;
                  const messageContent = isText
                    ? `${data.sender_name}: ${data.message}`
                    : `${data.sender_name} đã gửi ${data.type === "image" ? "một ảnh" : data.type === "video" ? "một video" : data.type === "document" ? "một tài liệu" : data.type === "multiple_files" ? "nhiều ảnh" : "một thông báo"}`;

                  showMessage({
                    message: prefix,
                    type: "info",
                    duration: 3000,
                    position: "top",
                    floating: true,
                    hideOnPress: true,
                    style: { alignSelf: 'center', backgroundColor: '#33FFFF', width: '100%' },
                    titleStyle: { color: '#000', fontWeight: 'bold' },
                    textStyle: { color: '#000' },
                    onPress: () => {
                   
                      navigation.navigate('ChatRoom', {
                        chats: latestChats.current.find(
                          (chat) => chat.conversation_id === data.conversation_id
                        ),
                        conversations: latestChats.current,
                      });
                    
                    },
                    renderCustomContent: () => (
                      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', padding: 8 }}>
                        <Image
                          source={{ uri: data.sender_avatar }}
                          style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
                        />
                        <Text style={{ color: '#000', fontWeight: 'bold', flexShrink: 1 }}>
                              {isText
                                ? `${data.sender_name}: ${data.message.length > 20
                                    ? data.message.substring(0, 20) + '...'
                                    : data.message}`
                                : messageContent}
                            </Text>
                          </View>
                      ),

                  });
                  loadConversations();
                } catch (error) {
                  console.error('Lỗi khi lấy thông tin conversation:', error);
                }
              }
          );
           
  

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
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('ChatRoom', {
          chats: item,
          conversations: chats,
        });
      }}
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
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Lỗi', 'Bạn chưa đăng nhập!');
        return;
      }
      await qrLogin(data, token);
      Alert.alert('Thành công', 'Đăng nhập web thành công!');
      setShowScanner(false);
      setScanned(false);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Có lỗi xảy ra');
      setShowScanner(false);
      setScanned(false);
      navigation.goBack();
    }
  };


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
          <TouchableOpacity
            // style={styles.qrButton}
            onPress={async () => {
              if (!permission?.granted) {
                await requestPermission();
              }
              setShowScanner(true);
              setScanned(false);
            }}
          >
            <Image
              source={require('../assets/zalo-icon/qr-code.png')}
              style= {{ width: 28, height: 28, tintColor: '#FFFFFF' }}
              // style={styles.qrIcon}
              resizeMode="contain"
            />
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
      {showScanner && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, backgroundColor: '#fff', padding: 10, borderRadius: 20 }}
            onPress={() => setShowScanner(false)}
          >
            <Text style={{ fontSize: 18 }}>Đóng</Text>
          </TouchableOpacity>
        </CameraView>
      )}
    </SafeAreaView>
  );
};

export default MessagesScreen;
