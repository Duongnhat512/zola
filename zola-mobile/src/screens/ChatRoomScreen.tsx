import React, { useState, useEffect, useRef } from "react";
import MessageActionModal from "./modal/MessageActionModal";
import EmojiPickerModal from "./modal/EmojiPickerModal";
import VideoPreviewModal from "./modal/VideoPreviewModal";
import ImagePreviewModal from "./modal/ImagePreviewModal";
import PinnedMessagePanel from "./modal/PinnedMessagePanel";
import { showMessage } from "react-native-flash-message";
import { checkIsGroup } from "../services/ConversationService";

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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as DocumentPicker from "expo-document-picker";
import Feather from "react-native-vector-icons/Feather";
import styles from "../styles/ChatRoomScreen.styles";
import setupSocket from "../services/Socket";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { Video } from "expo-av";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const ChatRoomScreen = ({ route, navigation }) => {
  const { chats, conversations } = route.params;
  const currentUser = useSelector((state) => state.user.user);
  const flatListRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState([]);
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
  const [pinnedMessages, setPinnedMessages] = useState([]);
  useEffect(() => {
    const initSocket = async () => {
      try {
        const socketInstance = await setupSocket();
        setSocket(socketInstance);

        socketInstance.on("connect", () => {
          socketInstance.emit("get_messages", {
            conversation_id: chats.conversation_id,
          });
          socketInstance.emit("get_pinned_messages", {
            conversation_id: chats.conversation_id,
          }); // Lấy danh sách tin nhắn ghim
        });

        socketInstance.on("message_sent", (msg) => {
            console.log("Message sent:", msg);
            socketInstance.emit("get_messages", { conversation_id: chats.conversation_id });
          });

        socketInstance.on("list_messages", handleListMessages);

        socketInstance.on("new_message", async (data) => {
          console.log("New message received:", data);
          const isMe = data.sender_id === currentUser.id;
          if (data.conversation_id === chats.conversation_id) {
            socketInstance.emit("get_messages", { conversation_id: chats.conversation_id });
          }
          if (!isMe) {
            try {
              const res = await checkIsGroup(data.conversation_id);
              const resConversation = res.conversation;
              let prefix = "";
              if (resConversation) {
                prefix =
                  resConversation.type === "group"
                    ? `${resConversation.name} (Nhóm)  `
                    : `${data.sender_name} (Riêng tư) `;
              }
              const isText = data.type === "text" && !data.is_deleted;
              const messageContent = isText
                ? `${data.sender_name}: ${data.message}`
                : `${data.sender_name} đã gửi ${
                    data.type === "image"
                      ? "một ảnh"
                      : data.type === "video"
                      ? "một video"
                      : data.type === "document"
                      ? "một tài liệu"
                      : "nhiều ảnh"

                  }`;

              showMessage({
                message: prefix,
                type: "info",
                duration: 3000,
                position: "top",
                floating: true,
                hideOnPress: true,
                style: {
                  alignSelf: "center",
                  backgroundColor: "#33FFFF",
                  width: "100%",
                },
                titleStyle: { color: "#000", fontWeight: "bold" },
                textStyle: { color: "#000" },
                onPress: () => {
                  navigation.navigate("ChatRoom", {
                    chats: conversations.find(
                      (chat) => chat.conversation_id === data.conversation_id
                    ),
                    conversations: conversations
                  });
                },
                renderCustomContent: () => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      width: "100%",
                      padding: 8,
                    }}
                  >
                    <Image
                      source={{ uri: data.sender_avatar }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        marginRight: 8,
                      }}
                    />
                    <Text
                      style={{
                        color: "#000",
                        fontWeight: "bold",
                        flexShrink: 1,
                      }}
                    >
                      {isText
                        ? `${data.sender_name}: ${
                            data.message.length > 20
                              ? data.message.substring(0, 20) + "..."
                              : data.message
                          }`
                        : messageContent}
                    </Text>
                  </View>
                ),
              });
            } catch (error) {
              console.error("Lỗi khi lấy thông tin conversation:", error);
            }
          }
        });

        socketInstance.on("message_pinned", (data) => {
          if (data.status === "success") {
            setPinnedMessages((prev) => {
              const exists = prev.some((msg) => msg.id === data.message_id);
              if (!exists) return [...prev, data.pinned_message];
              return prev;
            });
          }
        });

        return () => {
          socketInstance.off("connect");
          socketInstance.off("list_messages");
          socketInstance.off("hidden_message");
          socketInstance.off("message_deleted");
          socketInstance.off("new_message");
          socketInstance.off("message_sent");
        };
      } catch (error) {
        console.error("Socket init error:", error);
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

  const handlePinMessage = () => {
    if (!selectedMessage) return;
    socket.emit("pin_message", {
      message_id: selectedMessage.id,
      conversation_id: chats.conversation_id,
      message_text: selectedMessage.text,
    });
    setPinnedMessages((prev) => [
      ...prev,
      {
        id: selectedMessage.id,
        senderName: selectedMessage.senderName,
        text: selectedMessage.text,
      },
    ]);
  };
  const handleListMessages = (data) => {
  const sortedData = data.sort((a, b) => a.created_at.localeCompare(b.created_at));
  console.log("Received messages:", sortedData);
  const formatted1 = sortedData.map((msg) => {
    const isMe = msg.sender_id === currentUser.id;
    
    // Parse media nếu có
    let files = [];
    if (msg.media) {
      try {
        const mediaArray = JSON.parse(msg.media);
        if (Array.isArray(mediaArray) && mediaArray.length > 0) {
          files = mediaArray.map((media) => ({
            uri: media.fileUrl,
            name: media.fileName,
            type: media.fileType,
            size: media.fileSize,
          }));
        }
      } catch (e) {
        console.error("Parse media error:", e);
        files = [];
      }
    }

    return {
      id: msg.id,
      sender: isMe ? "me" : "other",
      senderName: isMe ? currentUser.fullname : msg.sender_name,
      text: msg.is_deleted ? "Tin nhắn đã thu hồi" : msg.message,
      avatar: isMe ? currentUser.avt : msg.sender_avatar,
      time: dayjs(msg.created_at).fromNow(),
      type: msg.is_deleted ? "deleted" : msg.type,
      files,
      status: "sent",
      pinned: msg.pinned,
    };
  });
  const formatted2 = JSON.parse(JSON.stringify(formatted1));
  setMessages(formatted1);
  setPinnedMessages(formatted2.filter((msg) => msg.pinned === true));
};

  // Hàm xử lý bỏ ghim tin nhắn
  const handleUnpinMessage = (messageId) => {
    const message = pinnedMessages.find((msg) => msg.id === messageId);
    if (!message) return;
    socket.emit("unpin_message", {
      message_id: message.id,
      conversation_id: chats.conversation_id,
      message_text: message.text,
    });

    setPinnedMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

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
        "image/*",
        "video/*",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/zip",
        "*/*", // Cho phép tất cả các loại file
      ],
      copyToCacheDirectory: true,
      multiple: true, // Cho phép chọn nhiều file
    });

    if (!result.canceled && result.assets?.length > 0) {
      setFile(result.assets);
    }
  };
  const pickImageOnly = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/*"],
    copyToCacheDirectory: true,
    multiple: true,
  });
  if (!result.canceled && result.assets?.length > 0) {
    setFile(result.assets);
  }
};

const pickVideoOnly = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["video/*"],
    copyToCacheDirectory: true,
    multiple: true,
  });
  if (!result.canceled && result.assets?.length > 0) {
    setFile(result.assets);
  }
};
  const getOriginalFileName = (fileName) => {
    if (!fileName) return "";
    const parts = fileName.split("-");
    if (parts.length > 2) {
      // Nếu có nhiều dấu '-', lấy phần sau cùng (tên gốc)
      return parts.slice(2).join("-");
    }
    if (parts.length > 1) {
      return parts.slice(1).join("-");
    }
    return fileName;
  };
  const sendMessage = async () => {
    if (!inputText.trim() && !file) {
      Alert.alert(
        "Thông báo",
        "Vui lòng nhập tin nhắn hoặc chọn tệp đính kèm."
      );
      return;
    }

    const tempId = `msg-${Date.now()}`;
    const now = new Date();
    const isGroup = chats.type === "group";

    setMessages((prev) => [
  ...prev,
  {
    id: tempId,
    text: inputText.trim(),
    type: file && file.length > 0 ? "media" : "text",
    sender: "me",
    senderName: currentUser.fullname,
    avatar: currentUser.avt,
    time: now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: "pending",
    files: file && file.length > 0
      ? file.map(f => ({ 
          uri: f.uri,
          name: f.name,
          type: f.mimeType,
          size: f.size,
        }))
      : [],
  },
]);

    if (file && file.length !== 0)

  try {
    // Đọc tất cả file thành base64 và gom vào mảng filesData
    const filesData = await Promise.all(
      file.map(async (f) => {
        const response = await fetch(f.uri);
        const blob = await response.blob();

        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        return {
          file_name: f.name,
          file_type: f.mimeType,
          file_size: f.size,
          file_data: `data:${f.mimeType};base64,${base64Data}`,
        };
      })
    );

    const msg = {
      conversation_id: chats.conversation_id,
      sender_id: currentUser.id,
      receiver_id: isGroup
        ? null
        : Array.isArray(chats.list_user_id)
        ? typeof chats.list_user_id[0] === "string"
          ? chats.list_user_id.find((id) => id !== currentUser.id)
          : chats.list_user_id?.filter(
              (user) => user.user_id !== currentUser.id
            )[0]?.user_id
        : null,
      message: inputText.trim(), // hoặc "" nếu không có text
      files: filesData, // gửi mảng files
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const event = isGroup ? "send_group_message" : "send_private_message";

    socket.emit(event, msg, () => {
      socket.emit("get_messages", { conversation_id: chats.conversation_id });
    });
    setInputText("");
    setFile([]); // Xóa file sau khi gửi
  } catch (error) {
    console.error("Lỗi gửi nhiều file:", error);
  } else {
      const msg = {
        conversation_id: chats.conversation_id,
        sender_id: currentUser.id,
        receiver_id: isGroup
          ? null
          : Array.isArray(chats.list_user_id)
          ? typeof chats.list_user_id[0] === "string"
            ? chats.list_user_id.find((id) => id !== currentUser.id)
            : chats.list_user_id?.filter(
                (user) => user.user_id !== currentUser.id
              )[0]?.user_id
          : null,
        message: inputText.trim(),
        status: "pending",
        created_at: now.toISOString(),
      };
      const event = isGroup ? "send_group_message" : "send_private_message";
      socket.emit(event, msg, () => {});
      socket.on("message_sent", (msg) => {
        socket.emit("get_messages", { conversation_id: chats.conversation_id });
        console.log("Message sent:", msg);
      });
      setInputText("");
      setFile([]);

    }
  };

  const deleteMessage = (id) => {
    socket.emit("set_hidden_message", {
      user_id: currentUser.id,
      message_id: id,
    });
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const revokeMessage = (id) => {
    socket.emit("delete_message", { user_id: currentUser.id, message_id: id });
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? { ...msg, text: "Tin nhắn đã thu hồi", file: null, type: "deleted" }
          : msg
      )
    );
  };
  const handleSelectPinnedMessage = (messageId) => {
    const index = messages.findIndex((msg) => msg.id === messageId);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };
  const renderMessage = ({ item }) => (
    <TouchableOpacity
      onLongPress={() => {
        if (item.sender === "me") {
          setSelectedMessage(item);
          setModalVisible(true);
        }
      }}
      disabled={item.type === "notify"} // Không cho long press notify
    >
      <View style={styles.messageContainer}>
        {item.type === "notify" ? (
          <View style={styles.notifyContainer}>
            <Text style={styles.notifyText}>{item.text}</Text>
          </View>
        ) : (
          <View>
            <View
              style={[
                styles.senderInfo,
                item.sender === "me" ? styles.rowReverse : styles.rowNormal,
              ]}
            >
              <Image source={{ uri: item.avatar }} style={styles.avatarSmall} />
              <Text style={styles.senderName}>{item.senderName}</Text>
            </View>

           <View
  style={[
    item.type === "deleted"
      ? styles.deletedMessage
      : styles.messageBubble,
    item.sender === "me" ? styles.myMessage : styles.theirMessage,
  ]}
>
  {item.pinned && (
    <Text style={{ fontSize: 12, color: "#ff9900" }}>📌</Text>
  )}

 {/* Hiển thị nhiều ảnh nếu có */}
{item.files && item.files.length > 1 && item.type !== "deleted" && (
  <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
    {item.files.map((f, idx) =>
      f.type === "image" && f.uri ? (
        <TouchableOpacity
          key={idx}
          onPress={() => {
            setSelectedImage(f.uri);
            setImagePreviewVisible(true);
          }}
        >
          <Image
            source={{ uri: f.uri }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#ddd",
              marginRight: 6,
              marginBottom: 6,
            }}
          />
        </TouchableOpacity>
      ) : null
    )}
  </View>
)}

{/* Nếu chỉ có 1 file (ảnh, video, hoặc file tài liệu) */}
{item.files && item.files.length === 1 && item.type !== "deleted" && (() => {
  const f = item.files[0];
  if (f.type === "image" && f.uri) {
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedImage(f.uri);
          setImagePreviewVisible(true);
        }}
      >
        <Image source={{ uri: f.uri }} style={styles.mediaPreview} />
      </TouchableOpacity>
    );
  }
  if (f.type?.startsWith("video") && f.uri) {
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedVideo(f.uri);
          setVideoPreviewVisible(true);
        }}
      >
        <Video
          source={{ uri: f.uri }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="contain"
          useNativeControls
          style={styles.mediaPreview}
        />
      </TouchableOpacity>
    );
  }
  // File tài liệu
  if (f.uri) {
    return (
      <TouchableOpacity
        onPress={() => Alert.alert("File", `Tên file: ${f.name}`)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
        }}
      >
        <Feather
          name="file"
          size={20}
          color="#007BFF"
          style={{ marginRight: 6 }}
        />
        <Text>{getOriginalFileName(f.name)}</Text>
      </TouchableOpacity>
    );
  }
  return null;
})()}



  <Text
    style={[
      styles.messageText,
      item.type === "deleted" && styles.deletedText,
    ]}
  >
    {item.text}
  </Text>
  <Text style={styles.messageTime}>
    {item.time}{" "}
    {item.status === "pending"
      ? "🕓"
      : item.status === "sent"
      ? "✅"
      : "❌"}
  </Text>
</View>
          </View>
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={30} color="#ffffff" />
            </TouchableOpacity>
            <Image
              source={{
                uri:
                  chats.avatar ||
                  "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
              }}
              style={styles.avartarHeader}
            />
            <Text style={styles.header}>
              {chats.name || "Người dùng không xác định"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (chats.type === "group") {
                  navigation.navigate("EditGroup", {
                    conversation: chats,
                    socket: socket,
                    currentUserId: currentUser.id,
                  });
                } else {
                  navigation.navigate("EditChat", {
                    conversation: chats,
                    socket: socket,
                    currentUserId: currentUser.id,
                  });
                }
              }}
              style={styles.backButton}
            >
              <Feather name="settings" size={30} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.bodyContainer}>
            <PinnedMessagePanel
              pinnedMessages={pinnedMessages}
              onSelectMessage={(id) => handleSelectPinnedMessage(id)}
              onUnpinMessage={(id) => handleUnpinMessage(id)}
            />
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />
{file.length > 0 && (
  <View style={{ marginVertical: 8 }}>
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
      {file.map((f, idx) =>
        f?.mimeType?.startsWith("image") && f.uri ? (
          <View key={idx} style={[styles.previewContainer, { position: "relative" }]}>
            <Image source={{ uri: f.uri }} style={styles.previewImageBeforeSend} />
            <TouchableOpacity
              onPress={() => setFile(file.filter((_, i) => i !== idx))}
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 2,
                elevation: 2,
                zIndex: 10,
              }}
            >
              <Text style={{ color: "#ff3333", fontWeight: "bold", fontSize: 16 }}>❌</Text>
            </TouchableOpacity>
          </View>
        ) : null
      )}
    </View>
  </View>
)}

           {file.length === 1 && file[0]?.mimeType?.startsWith("video") && (
  <View style={styles.previewContainer}>
    <Video
      source={{ uri: file[0].uri }}
      rate={1.0}
      volume={1.0}
      isMuted={false}
      resizeMode="contain"
      useNativeControls
      style={styles.previewImage}
    />
    <TouchableOpacity
      onPress={() => setFile([])}
      style={styles.cancelPreviewButton}
    >
      <Text style={styles.cancelPreviewText}>Hủy chọn video</Text>
    </TouchableOpacity>
  </View>
)}
            {/* Xem trước file document (Word, Excel, PDF, ZIP, ...) */}
           {file.length === 1 &&
  !file[0]?.mimeType?.startsWith("image") &&
  !file[0]?.mimeType?.startsWith("video") &&
  file[0].uri && (
    <View style={styles.previewContainer}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Feather
          name="file"
          size={32}
          color="#007BFF"
          style={{ marginRight: 10 }}
        />
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {getOriginalFileName(file[0].name)}
        </Text>
      </View>
      <Text style={{ color: "#555", marginBottom: 8 }}>
        Dung lượng:{" "}
        {file[0].size
          ? (file[0].size / 1024).toFixed(1) + " KB"
          : "Không rõ"}
      </Text>
      <TouchableOpacity
        onPress={() => setFile([])}
        style={styles.cancelPreviewButton}
      >
        <Text style={styles.cancelPreviewText}>Hủy chọn file</Text>
      </TouchableOpacity>
    </View>
)}
          </View>
          <View style={styles.footerWrapper}>
            <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
    <Feather name="smile" size={20} color="#000000" style={{ paddingRight: 10 }} />
  </TouchableOpacity>

  {/* Icon chọn ảnh */}
  <TouchableOpacity onPress={pickImageOnly} style={styles.fileButton}>
    <Feather name="image" size={20} color="#007BFF"/>
  </TouchableOpacity>

  {/* Icon chọn video */}
  <TouchableOpacity onPress={pickVideoOnly} style={styles.fileButton}>
    <Feather name="video" size={20} color="#FF3333"/>
  </TouchableOpacity>

  {/* Icon kẹp giấy: chọn mọi loại file */}
  <TouchableOpacity onPress={pickFile} style={styles.fileButton}>
    <Feather name="paperclip" size={20} color="#000000"/>
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
            onPin={() => {
              handlePinMessage();
              setModalVisible(false);
            }}
            navigation={navigation}
            styles={styles}
            message={selectedMessage}
            conversations={conversations}
            disablePin={
              selectedMessage
                ? pinnedMessages.some((msg) => msg.id === selectedMessage.id)
                : false
            }
          />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;
