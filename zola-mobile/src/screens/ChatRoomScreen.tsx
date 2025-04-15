import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { Buffer } from 'buffer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import styles from '../styles/ChatRoomScreen.styles';
import setupSocket from '../services/Socket';
import { useSelector } from 'react-redux';
import { deleteMessage as deleteMessageAPI } from '../services/ChatService';

const ChatRoomScreen = ({ route, navigation }) => {
  const { conversationId, ortherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const flatListRef = useRef(null);
  const intervalRef = useRef(null);
  const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    const initSocket = async () => {
      try {
        const s = await setupSocket();
        setSocket(s);

        s.on("connect", () => {
          console.log("Socket connected");
          s.emit("get_messages", { conversation_id: conversationId });
        });
        s.on("list_messages", (data) => {
          // console.log("list_messages", data);
          const sortedData = data
          .filter((msg) => !msg.is_deleted)
          .sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          const formatted = sortedData.map((msg) => ({
            id: msg.message_id,
            sender: msg.sender_id === currentUser.id ? "me" : "other",
            senderName: msg.sender_id === currentUser.id ? currentUser.fullname : ortherUser.fullname,
            text: msg.message,
            avatar: msg.sender_id === currentUser.id ? currentUser.avt : ortherUser.avt,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            file: msg.media ? { uri: msg.media, name: msg.media.split("/").pop() } : undefined,
            status: "sent",
          }));
          setMessages(formatted);
          setLoading(false);
        });

        s.emit("get_messages", { conversation_id: conversationId });

        intervalRef.current = setInterval(() => {
          s.emit("get_messages", { conversation_id: conversationId });
        }, 1000);


        return () => clearInterval(intervalRef.current);
      } catch (error) {
        console.error("Lỗi khi thiết lập socket:", error);
        setLoading(false);
      }
    };

    initSocket();

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("list_messages");
        socket.off("new_message");
        socket.off("connect_error");
      }
      clearTimeout(intervalRef.current);
    };
  }, [conversationId]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!result.canceled && result.assets?.length > 0) {
      setFile(result.assets[0]);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() && !file) {
      Alert.alert('Thông báo', 'Vui lòng nhập tin nhắn hoặc chọn tệp đính kèm.');
      return;
    }

    const tempId = `msg-${Date.now()}`;
    const now = new Date();

    const newMsg = {
      id: tempId,
      text: inputText || undefined,
      sender: 'me',
      senderName: currentUser.fullname,
      file: file || undefined,
      avatar: currentUser.avt,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setFile(null);

    if (file) {
      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(',')[1];

          const fileMessage = {
            conversation_id: conversationId,
            sender_id: currentUser.id,
            receiver_id: ortherUser?.id,
            file_name: file.name,
            file_type: file.mimeType,
            file_size: file.size,
            file_data: `data:${file.mimeType};base64,${base64Data}`,
            message: `Đã gửi file: ${file.name}`,
          };

          socket?.emit('send_private_file', fileMessage, (response) => {
            if (response.success) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempId ? { ...m, status: 'sent', time: response.time || m.time } : m
                )
              );
            } else {
              setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
              );
            }
          });
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Lỗi khi xử lý file:", error);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
        );
      }
    }

    if (inputText.trim()) {
      const textMessage = {
        conversation_id: conversationId,
        user_id: currentUser.id,
        sender_id: currentUser.id,
        receiver_id: ortherUser?.id,
        message: inputText,
        type: 'text',
        status: 'sent',
        created_at: now.toISOString(),
        temp_id: tempId + '-text',
      };

      socket?.emit('send_private_message', textMessage, (response) => {
        if (response.status === 'success') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === textMessage.temp_id ? { ...m, status: 'sent', time: response.time || m.time } : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === textMessage.temp_id ? { ...m, status: 'failed' } : m))
          );
        }
      });
    }
  };

  const handleLongPressMessage = (msg) => {
    if (msg.sender === 'me') {
      setSelectedMessage(msg);
      setModalVisible(true);
    }
  };

  const deleteMessage = async () => {
    try {
      // Gọi API xóa tin nhắn
      await deleteMessageAPI(selectedMessage.id);

      // Cập nhật UI sau khi xóa tin nhắn
      setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
      setModalVisible(false);
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
      Alert.alert("Lỗi", "Không thể xóa tin nhắn. Vui lòng thử lại.");
    }
  };

  const editMessage = () => {
    setInputText(selectedMessage.text);
    setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
    setModalVisible(false);
  };

  const renderMessage = ({ item }) => (
    <TouchableOpacity onLongPress={() => handleLongPressMessage(item)}>
      <View style={styles.messageContainer}>
        <View style={[styles.senderInfo, item.sender === 'me' ? styles.rowReverse : styles.rowNormal]}>
          <Image source={{ uri: item.avatar }} style={styles.avatarSmall} />
          <Text style={styles.senderName}>{item.senderName}</Text>
        </View>

        <View style={[styles.messageBubble, item.sender === 'me' ? styles.myMessage : styles.theirMessage]}>
          {/* Hiển thị file (nếu có) trước */}
          {item.file && (
            <View>
              {item.file.uri.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                <Image source={{ uri: item.file.uri }} style={styles.mediaPreview} />
              ) : (
                <Text>{item.file.name}</Text>
              )}
            </View>
          )}

          {/* Hiển thị tin nhắn văn bản nếu có */}
          {item.text && <Text style={styles.messageText}>{item.text}</Text>}

          <Text style={styles.messageTime}>
            {item.time}{' '}
            {item.status === 'pending' ? '🕓' : item.status === 'sent' ? '✅' : item.status === 'failed' ? '❌' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.header}>{ortherUser.fullname}</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {file?.mimeType?.startsWith('image') && (
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <Text>{file.name}</Text>
            <Image source={{ uri: file.uri }} style={{ width: 200, height: 200, resizeMode: 'contain' }} />
          </View>
        )}

        <View style={styles.footerWrapper}>
          <TouchableOpacity onPress={pickFile} style={styles.fileButton}>
            <Text style={{ fontSize: 22 }}>📎</Text>
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal sửa xoá */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Tuỳ chọn tin nhắn</Text>
              {/* <TouchableOpacity onPress={editMessage} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>✏️ Sửa</Text>
              </TouchableOpacity> */}
              <TouchableOpacity onPress={deleteMessage} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>🗑️ Xoá</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>❌ Huỷ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;
