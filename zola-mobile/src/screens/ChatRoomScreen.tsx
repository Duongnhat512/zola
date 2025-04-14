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
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import styles from '../styles/ChatRoomScreen.styles';
import setupSocket from '../services/Socket';
import { useSelector } from 'react-redux';

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
          // console.log("✅ Socket connected");
          s.emit("get_messages", { conversation_id: conversationId });
        });

        s.on("list_messages", (data) => {
          const sortedData = data.sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          const formatted = sortedData.map((msg) => ({
            id: msg.message_id,
            sender: msg.sender_id === currentUser.id ? "me" : "other",
            senderName: msg.sender_id === currentUser.id ? currentUser.fullname : "Người dùng",
            text: msg.message,
            avatar: msg.sender_id === currentUser.id ? currentUser.avt : "/default.jpg",
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            file: msg.media ? { uri: msg.media, name: msg.media.split("/").pop() } : undefined,
            status: "sent",
          }));
          setMessages(formatted);
          setLoading(false);
        });

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
      clearInterval(intervalRef.current);
    };
  }, [conversationId]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!result.canceled && result.assets?.length > 0) {
      setFile(result.assets[0]);
    }
  };

  const sendMessage = () => {
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

    const messageData = {
      conversation_id: conversationId,
      user_id: currentUser.id,
      sender_id: currentUser.id,
      receiver_id: ortherUser?.id,
      message: inputText,
      type: file ? 'file' : 'text',
      media: file ? file.uri : '',
      status: 'sent',
      created_at: now.toISOString(),
      temp_id: tempId,
    };

    socket?.emit('send_private_message', messageData, (response) => {
      if (response.status === 'success') {
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

  const handleLongPressMessage = (msg) => {
    if (msg.sender === 'me') {
      setSelectedMessage(msg);
      setModalVisible(true);
    }
  };

  const deleteMessage = () => {
    setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
    setModalVisible(false);
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
          {item.text && <Text style={styles.messageText}>{item.text}</Text>}
          {item.file && (
            <View>
              {item.file.uri.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                <Image source={{ uri: item.file.uri }} style={styles.mediaPreview} />
              ) : (
                <Text>{item.file.name}</Text>
              )}
            </View>
          )}
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
              <TouchableOpacity onPress={editMessage} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>✏️ Sửa</Text>
              </TouchableOpacity>
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
