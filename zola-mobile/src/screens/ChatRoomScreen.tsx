import React, { useState, useEffect, useRef } from 'react';
import MessageActionModal from './modal/MessageActionModal';
import EmojiPickerModal from './modal/EmojiPickerModal';
import VideoPreviewModal from './modal/VideoPreviewModal';
import ImagePreviewModal from './modal/ImagePreviewModal';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import Feather from 'react-native-vector-icons/Feather';
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
  const isValidInput = inputText.trim().length > 0 || file !== null;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);


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
          console.log('Messages:', formatted);
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
 
const handleEmojiSelect = (emoji) => {
  if (!emoji) return;
  setInputText((prev) => prev + emoji); // Thêm emoji vào input
  // KHÔNG đóng modal ở đây!
  // setShowEmojiPicker(false);
  inputRef.current?.focus();
};

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
       type: [
      'image/*',
      'video/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      '*/*', // Cho phép tất cả các loại file
    ],
      copyToCacheDirectory: true,
      multiple: false,
    });
  
    if (!result.canceled && result.assets?.length > 0) {
      setFile(result.assets[0]);
    }
  };
const getOriginalFileName = (fileName) => {
  if (!fileName) return '';
  const parts = fileName.split('-');
  if (parts.length > 2) {
    // Nếu có nhiều dấu '-', lấy phần sau cùng (tên gốc)
    return parts.slice(2).join('-');
  }
  if (parts.length > 1) {
    return parts.slice(1).join('-');
  }
  return fileName;
};
  const sendMessage = async () => {
    if (!inputText.trim() && !file) {
      Alert.alert('Thông báo', 'Vui lòng nhập tin nhắn hoặc chọn tệp đính kèm.');
      return;
    }

    const tempId = `msg-${Date.now()}`;
    const now = new Date();
    const isGroup = chats.type === 'group';
   
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        text: inputText.trim(),
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
            message: inputText.trim(),
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
        message: inputText.trim(),
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
    // Nếu là ảnh hoặc video thì preview, còn lại thì mở file (nếu muốn)
    if (item.type === 'image') {
      setSelectedImage(item.file.uri);
      setImagePreviewVisible(true);
    } else if (item.type === 'video') {
      setSelectedVideo(item.file.uri);
      setVideoPreviewVisible(true);
    } else {
      // Có thể mở file bằng Linking.openURL(item.file.uri) nếu muốn
      Alert.alert('File', `Tên file: ${item.file.name}`);
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
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
        <Feather name="file" size={20} color="#007BFF" style={{ marginRight: 6 }} />
        <Text>{getOriginalFileName(item.file.name)}</Text>
      </View>
    )}
  </TouchableOpacity>
)}
              <Text style={[styles.messageText, item.type === 'deleted' && styles.deletedText]}>
                {item.text}
              </Text>
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={30} color="#ffffff"/>
          </TouchableOpacity>
          <Image source={{ uri: chats.avatar }} style={styles.avartarHeader} />
          <Text style={styles.header}>{chats.name || 'Người dùng không xác định'}</Text>
          <TouchableOpacity
            onPress={() => {
                

              if (chats.type === "group") {
              navigation.navigate('EditGroup', {
                conversation: chats,
                socket: socket,
                currentUserId: currentUser.id,
              });
            }
              else {
              navigation.navigate("EditChat",{ friendProfile:chats});
            }
            }}
            style={styles.backButton}
              >
            <Feather name="settings" size={30} color="#ffffff"/>
          </TouchableOpacity>
        </View>
        <View style={styles.bodyContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
   
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
          {/* Xem trước file document (Word, Excel, PDF, ZIP, ...) */}
            {file && !file?.mimeType?.startsWith('image') && !file?.mimeType?.startsWith('video') && file.uri && (
              <View style={styles.previewContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Feather name="file" size={32} color="#007BFF" style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {getOriginalFileName(file.name)}
                  </Text>
                </View>
                <Text style={{ color: '#555', marginBottom: 8 }}>
                  Dung lượng: {file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'Không rõ'}
                </Text>
                <TouchableOpacity onPress={() => setFile(null)} style={styles.cancelPreviewButton}>
                  <Text style={styles.cancelPreviewText}>Hủy chọn file</Text>
                </TouchableOpacity>
              </View>
            )}
          
        </View>
        <View style={styles.footerWrapper}>
          <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Feather name="smile" size={30} color="#000000" style={{paddingRight:10}} />        
          </TouchableOpacity>
          <TouchableOpacity onPress={pickFile} style={styles.fileButton}>
            <Feather name="paperclip" size={30} color="#000000" style={{paddingRight:10}} />        
          </TouchableOpacity>
          
  
          <View style={styles.footerContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={[styles.sendButton, { opacity: isValidInput ? 1 : 0.5 }]} // Mờ nút khi không hợp lệ
              disabled={!isValidInput} // Disable nút khi input không hợp lệ
            >
              <Text style={styles.sendButtonText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>
      
      {/* Modal: Xem trước ảnh */}
      <ImagePreviewModal
          visible={imagePreviewVisible}
          imageUri={selectedImage}
          onClose={() => setImagePreviewVisible(false)}
          styles={styles}
      />
      {/* Modal: Xem trước video */}
      <VideoPreviewModal
          visible={videoPreviewVisible}
          videoUri={selectedVideo}
          onClose={() => setVideoPreviewVisible(false)}
          styles={styles}
      />
      

      {/* Modal: Emoji */}
      <EmojiPickerModal
          visible={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onEmojiSelected={handleEmojiSelect}
          styles={styles}
      />
      {/* Modal: Thu hồi/Xóa */}
      <MessageActionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onRevoke={() => {
            revokeMessage(selectedMessage.id);
            setModalVisible(false);
          }}
          onDelete={() => {
            deleteMessage(selectedMessage.id);
            setModalVisible(false);
          }}
          styles={styles}
        />
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;