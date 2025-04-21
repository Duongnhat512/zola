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
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { Video } from 'expo-av';
dayjs.extend(relativeTime);
dayjs.locale('vi');

const ChatRoomScreen = ({ route, navigation }) => {
  const { chats } = route.params;
  const currentUser = useSelector((state) => state.user.user);
  const flatListRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [socket, setSocket] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  



  useEffect(() => {
    const initSocket = async () => {
      try {
        const socketInstance = await setupSocket();
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
          socketInstance.emit('get_messages', { conversation_id: chats.conversation_id });
        });

        socketInstance.on('list_messages', (data) => {
          const sortedData = data.sort((a, b) => a.created_at.localeCompare(b.created_at));
          const formatted = sortedData.map((msg) => {
            const isMe = msg.sender_id === currentUser.id;
            return {
              id: msg.id,
              sender: isMe ? 'me' : 'other',
              senderName: isMe ? currentUser.fullname : msg.sender_name,
              text: msg.is_deleted ? 'Tin nhắn đã thu hồi' : msg.message,
              avatar: isMe ? currentUser.avt : msg.sender_avatar,
              time: dayjs(msg.created_at).fromNow(),
              type: msg.is_deleted ? 'deleted' : msg.type,
              file: msg.media ? { uri: msg.media, name: msg.media.split('/').pop() } : undefined,
              status: 'sent',
            };
          });
          setMessages(formatted);
        });

        socketInstance.on('hidden_message', (data) => {
          setMessages((prev) => prev.filter((msg) => msg.id !== data.message_id));
        });

        socketInstance.on('message_deleted', (data) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.message_id
                ? { ...msg, text: 'Tin nhắn đã thu hồi', file: null, type: 'deleted' }
                : msg
            )
          );
        });

        socketInstance.on('new_message', (data) => {
          const isMe = data.sender_id === currentUser.id;
          const newMessage = {
            id: data.id,
            sender: isMe ? 'me' : 'other',
            senderName: isMe ? currentUser.fullname : data.sender_name,
            text: data.is_deleted ? 'Tin nhắn đã thu hồi' : data.message,
            avatar: isMe ? currentUser.avt : data.sender_avatar,
            time: dayjs(data.created_at).fromNow(),
            type: data.is_deleted ? 'deleted' : data.type,
            file: data.media ? { uri: data.media, name: data.media.split('/').pop() } : undefined,
            status: 'sent',
          };
          setMessages((prev) => [...prev, newMessage]);
        });

        return () => {
          socketInstance.off('connect');
          socketInstance.off('list_messages');
          socketInstance.off('hidden_message');
          socketInstance.off('message_deleted');
          socketInstance.off('new_message');
        };
      } catch (error) {
        console.error('Socket init error:', error);
      }
    };

    initSocket();
  }, [chats.conversation_id]);


  useEffect(() => {
    if (socket && chats.conversation_id) {
      const timeout = setTimeout(() => {
        socket.emit("get_messages", { conversation_id: chats.conversation_id });
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [socket, chats.conversation_id]);
 

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'video/*', '*/*'], 
      copyToCacheDirectory: true,
      multiple: false,
    });
  
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
    const isGroup = chats.list_user_id?.length > 2;
   
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        text: inputText,
        type: file ? file.type : 'text',
        sender: 'me',
        senderName: currentUser.fullname,
        file_name: file?.name,
        avatar: currentUser.avt,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        file: file ? { uri: file.uri, name: file.name } : null,
      },
    ]);

    if (file) {
      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(',')[1];

          const msg = {
            conversation_id: chats.conversation_id,
            sender_id: currentUser.id,
            receiver_id: isGroup ? null : chats.list_user_id.filter(user => user.user_id !== currentUser.id)[0]?.user_id,
            message: inputText,
            file_name: file.name,
            file_type: file.mimeType,
            file_size: file.size,
            file_data: `data:${file.mimeType};base64,${base64Data}`,
            status: 'pending',
            created_at: now.toISOString(),
          };

          const event = isGroup ? 'send_group_message' : 'send_private_message';
          socket.emit(event, msg,() => {});
          socket.on("message_sent", (msg) => {
            socket.emit("get_messages", { conversation_id: chats.conversation_id });
          });
        };
        reader.onerror = (error) => {
          console.error('Lỗi đọc tệp:', error);
        };
        reader.readAsDataURL(blob);
        setInputText('');
        setFile(null);

      } catch (error) {
        console.error('Lỗi tải tệp:', error);
      }
    } else {
     
      const msg = {
        conversation_id: chats.conversation_id,
        sender_id: currentUser.id,
        receiver_id: isGroup ? null : chats.list_user_id.filter(user => user.user_id !== currentUser.id)[0]?.user_id,
        message: inputText,
        status: 'pending',
        created_at: now.toISOString(),
      };
      const event = isGroup ? 'send_group_message' : 'send_private_message';
      socket.emit(event, msg,() => {});
      socket.on("message_sent", (msg) => {
        socket.emit("get_messages", { conversation_id: chats.conversation_id });      
      });
      setInputText('');

    }
  };

  const deleteMessage = (id) => {
    socket.emit('set_hidden_message', { user_id: currentUser.id, message_id: id });
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const revokeMessage = (id) => {
    socket.emit('delete_message', { user_id: currentUser.id, message_id: id });
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, text: 'Tin nhắn đã thu hồi', file: null, type: 'deleted' } : msg
      )
    );
  };

  const renderMessage = ({ item }) => (
    <TouchableOpacity
      onLongPress={() => {
        if (item.sender === 'me') {
          setSelectedMessage(item);
          setModalVisible(true);
        }
      }}
      disabled={item.type === 'notify'} // Không cho long press notify
    >
      <View style={styles.messageContainer}>
        {item.type === 'notify' ? (
          <View style={styles.notifyContainer}>
            <Text style={styles.notifyText}>{item.text}</Text>
          </View>
        ) : (
          <>
            <View style={[
              styles.senderInfo,
              item.sender === 'me' ? styles.rowReverse : styles.rowNormal
            ]}>
              <Image source={{ uri: item.avatar }} style={styles.avatarSmall} />
              <Text style={styles.senderName}>{item.senderName}</Text>
            </View>
  
            <View style={[
              item.type === 'deleted' ? styles.deletedMessage : styles.messageBubble,
              item.sender === 'me' ? styles.myMessage : styles.theirMessage
            ]}>
              {item.file && item.type !== 'deleted' && (
                <TouchableOpacity onPress={() => {
                  if (item.type === 'image') {
                    setSelectedImage(item.file.uri);
                    setImagePreviewVisible(true);
                  }
                  if (item.type === 'video') {
                    setSelectedVideo(item.file.uri);
                    setVideoPreviewVisible(true);
                  }
                }}>
                  {item.type === 'image' ? (
                    <Image source={{ uri: item.file.uri }} style={styles.mediaPreview} />
                  ) : item.type === 'video' ? (
                    <Video
                      source={{ uri: item.file.uri }}
                      rate={1.0}
                      volume={1.0}
                      isMuted={false}
                      resizeMode="contain"
                      useNativeControls
                      style={styles.mediaPreview}
                    />
                  ) : (
                    <Text>{item.file.name}</Text>
                  )}
                </TouchableOpacity>
              )}
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageTime}>
                {item.time} {item.status === 'pending' ? '🕓' : item.status === 'sent' ? '✅' : '❌'}
              </Text>
            </View>
          </>
        )}
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
          <Text style={styles.header}>{chats.name || 'Người khác'}</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('EditGroup', {
                conversation: chats,
                socket: socket,
                currentUserId: currentUser.id,
              });
            }}
            style={styles.backButton}
              >
            <Text style={styles.backButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

          {file?.mimeType?.startsWith('image') && file.uri && (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: file.uri }}
                style={styles.previewImage}
              />
              <TouchableOpacity onPress={() => setFile(null)} style={styles.cancelPreviewButton}>
                <Text style={styles.cancelPreviewText}>Hủy chọn ảnh</Text>
              </TouchableOpacity>
            </View>
          )}

          {file?.mimeType?.startsWith('video') && file.uri && (
            <View style={styles.previewContainer}>
              <Video
                source={{ uri: file.uri }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="contain"
                useNativeControls
                style={styles.previewImage}
              />
              <TouchableOpacity onPress={() => setFile(null)} style={styles.cancelPreviewButton}>
                <Text style={styles.cancelPreviewText}>Hủy chọn video</Text>
              </TouchableOpacity>
            </View>
          )}

        <View style={styles.footerWrapper}>
          <TouchableOpacity onPress={pickFile} style={styles.fileButton}>
            <Text style={{ fontSize: 22 }}>📎</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => setEmojiModalVisible(true)} style={styles.emojiButton}>
            <Text style={styles.emojiButtonText}>🙂</Text>
          </TouchableOpacity> */}
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
      </KeyboardAvoidingView>

      {/* Modal: Ảnh */}
      <Modal visible={imagePreviewVisible} transparent animationType="fade">
      {/* Nhấn vùng ngoài ảnh sẽ đóng modal */}
          <TouchableOpacity onPress={() => setImagePreviewVisible(false)} style={styles.modalVideoContainer}>
            <View style={styles.previewVideoContainer}>
              {/* Nhấn vào ảnh không bị đóng modal */}
              <TouchableOpacity activeOpacity={1}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        
        {/* Modal: Video */}
        <Modal visible={videoPreviewVisible} transparent animationType="fade">
        {/* Chỉ đóng modal khi nhấn vào vùng ngoài video */}
          <TouchableOpacity onPress={() => setVideoPreviewVisible(false)} style={styles.modalVideoContainer}>
            <View style={styles.previewVideoContainer}>
              {/* Video không đóng modal khi nhấn vào nó */}
              <TouchableOpacity activeOpacity={1}>
                <Video
                  source={{ uri: selectedVideo }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="contain"
                  useNativeControls
                  style={styles.previewImage}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>



      {/* Modal: Thu hồi/Xóa */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlayBackground}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => { revokeMessage(selectedMessage.id); setModalVisible(false); }}>
              <Text style={styles.modalOptionText}>Thu hồi</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { deleteMessage(selectedMessage.id); setModalVisible(false); }}>
              <Text style={styles.modalOptionText}>Xóa ở phía bạn</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalOptionText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;