import React, { useEffect, useState } from "react";
import { SmileOutlined, SendOutlined } from "@ant-design/icons";
import {
  EllipsisOutlined,
  CopyOutlined,
  DeleteOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Input, Avatar, Button, Dropdown, Menu, Image } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  PaperClipOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import socket from "../../services/Socket";
import { useSelector } from "react-redux";
import { useRef } from "react";
import AddMember from "../../pages/Group/AddMember";
import {
  addEmojiToInput,
  copyMessage,
  deleteMessage,
  handleFileChange,
  handleImageChange,
  handleNewMessage,
  handleVideoChange,
  markAsRead,
  revokeMessage,
  scrollToBottom,
  sendMessage,
} from "../../utils/chatHelpers";
import EmojiDropdown from "../untilChatWindow/EmojiDropdown";
import MessageOptions from "../untilChatWindow/MessageOptions";
import ChatHeader from "../untilChatWindow/ChatHeader";
import MessageList from "../untilChatWindow/MessageList";
import { toast } from "react-toastify";
const ChatWindow = ({
  selectedChat,
  setChats,
  fetchConversations,
  isInfoGroupVisible,
  setIsInfoGroupVisible,
  infoPermissions
}) => {
  const selectedChatRef = useRef();
  const [emojiList, setEmojiList] = useState({});
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const handleOpen = () => setIsModalVisible(true);
  const handleClose = () => setIsModalVisible(false);
  const [visibleMessages, setVisibleMessages] = useState([]); // Tin nhắn hiển thị
  const [page, setPage] = useState(1); // Trang hiện tại
  const pageSize = 10; // Số lượng tin nhắn mỗi trang
  const [isLoading, setIsLoading] = useState(false); // Trạng thái đang tải tin nhắn
  const [hasMoreMessages, setHasMoreMessages] = useState(true); // Kiểm tra còn tin nhắn để tải không
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);
  const userMain = useSelector((state) => state.user.user);

  useEffect(() => {
    if (!selectedChat?.conversation_id) return;
    socket.emit("get_messages", {
      conversation_id: selectedChat.conversation_id,
    });

    socket.on("list_messages", (data) => {
      const dataSort = data.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      console.log("list_messages", dataSort);
      const formattedMessages = dataSort.map((msg) => ({
        id: msg.id,
        sender: msg.sender_id === userMain.id ? "me" : "other",
        avatar:
          msg.sender_id === userMain.id
            ? userMain.avatar || "/default-avatar.jpg"
            : msg.sender_avatar || "/default-avatar.jpg",
        text: msg.message,
        media: msg.media,
        type: msg.type,
        time: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        file_name: msg.file_name || null,
      }));
      console.log("formattedMessages", formattedMessages);

      setMessages(formattedMessages);
      setVisibleMessages(formattedMessages.slice(-pageSize));
    });

    return () => {
      socket.off("list_messages");
    };
  }, [selectedChat?.conversation_id, selectedChat?.user_id, userMain.id]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("new_message", (msg) => {
      console.log("New message event received:", msg);
      handleNewMessage(
        msg,
        selectedChatRef,
        userMain,
        setMessages,
        setChats,
        (conversationId) =>
          markAsRead(socket, conversationId, userMain.id, setChats)
      );
    });

    return () => {
      socket.off("new_message");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [userMain.id, setChats]);
  useEffect(() => {
    setTimeout(() => {
      scrollToBottom(messagesEndRef);
    }, 300);
  }, [messages]);
  useEffect(() => {
    if (selectedChat?.conversation_id) {
      markAsRead(socket, selectedChat.conversation_id, userMain.id, setChats);
    }
  }, [selectedChat]);
  useEffect(() => {
    // Gọi API để lấy danh sách emoji
    const fetchEmojis = async () => {
      try {
        const response = await fetch("https://api.github.com/emojis");
        const data = await response.json();
        setEmojiList(data);
      } catch (error) {
        console.error("Failed to fetch emojis:", error);
      }
    };

    fetchEmojis();
  }, []);
  useEffect(() => {
    socket.on("message_deleted", (msg) => {
      const currentChat = selectedChatRef.current;
      console.log("Message deleted event received:", msg);

      if (currentChat?.conversation_id === msg.conversation_id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.message_id
              ? { ...m, text: msg.message, media: null, file_name: null }
              : m
          )
        );
      }
    });

    return () => {
      socket.off("message_deleted");
    };
  }, [userMain.id]);
  const handleEmojiClick = (url) => {
    addEmojiToInput(url, setInput, setIsEmojiPickerVisible);
  };
  useEffect(() => {
    const handleNewMember = (data) => {
      toast.info("Bạn đã được thêm vào group", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      fetchConversations();
    };
    socket.on("new_member", handleNewMember);
    return () => {
      socket.off("new_member", handleNewMember);
    };
  }, [socket, selectedChat?.conversation_id, fetchConversations]);

  const messagesEndRef = useRef(null);
  const handleCopyMessage = (text) => {
    copyMessage(text);
  };
  const loadMoreMessages = () => {
    if (isLoading || !hasMoreMessages) return; 
    setIsLoading(true); 

    const container = document.querySelector(".message-list-container");
    const currentScrollTop = container.scrollTop;
    const currentScrollHeight = container.scrollHeight;

    const nextPage = page + 1;
    const startIndex = Math.max(messages.length - nextPage * pageSize, 0);
    const endIndex = messages.length;
    const moreMessages = messages.slice(startIndex, endIndex);
    setTimeout(() => {
      if (moreMessages.length === visibleMessages.length) {
        setHasMoreMessages(false);
      } else {
        setVisibleMessages(moreMessages); 
        setPage(nextPage); 
      }
      setIsLoading(false); 
      setTimeout(() => {
        const newScrollHeight = container.scrollHeight; 
        container.scrollTop = newScrollHeight - currentScrollHeight + currentScrollTop;
      }, 100);
    }, 1000);
  };
  const handleScroll = (e) => {
    if (!hasMoreMessages) return;

    if (e.target.scrollTop === 0) {
      loadMoreMessages();
    }
  };
  const handleDeleteMessage = (id) => {
    deleteMessage(socket, userMain.id, id, setMessages);
  };

  const handleRevokeMessage = (id) => {
    revokeMessage(socket, userMain.id, id, setMessages);
  };
  const handleSendMessage = (fileData = null) => {
    if (!input.trim() && !fileData) return;
    sendMessage({
      input,
      previewImage,
      selectedFile: fileData || selectedFile,
      selectedChat,
      userMain,
      setMessages,
      fetchConversations,
      setInput,
      setPreviewImage,
      setSelectedFile,
      setSelectedImage,
      socket,
      selectedImage,
      selectedVideo,
      setSelectedVideo,
    });
  };
  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center flex-col text-center flex-1">
        <h1 className="text-2xl font-semibold text-gray-800">
          Chào mừng đến với <span className="text-blue-600">Zalo PC</span>!
        </h1>
        <p className="text-sm text-gray-600 mt-2 max-w-md">
          Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân,
          bạn bè được tối ưu hoá cho máy tính của bạn.
        </p>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col bg-white">
      <ChatHeader
        selectedChat={selectedChat}
        handleOpen={handleOpen}
        setIsInfoGroupVisible={setIsInfoGroupVisible}
      />
      <MessageList
        messages={visibleMessages}
        handleCopyMessage={handleCopyMessage}
        handleDeleteMessage={handleDeleteMessage}
        handleRevokeMessage={handleRevokeMessage}
        messagesEndRef={messagesEndRef}
        onScroll={handleScroll}
        isLoading={isLoading}
        hasMoreMessages={hasMoreMessages}
      />
      {isModalVisible && (
        <AddMember
          selectedChat={selectedChat}
          visible={isModalVisible}
          onClose={handleClose}
        />
      )}
      <div className="p-4 bg-white border-t">
        {previewImage && (
          <div className="mb-4">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-xs rounded-lg"
            />
          </div>
        )}
        {selectedFile && (
          <div className="mb-4">
            <p className="text-gray-600">File: {selectedFile.file_name}</p>
          </div>
        )}
        <div className="flex items-center gap-4 mb-2 text-gray-600">
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleImageChange(e, setPreviewImage, setSelectedImage)
            }
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <PictureOutlined style={{ fontSize: "20px" }} />
          </label>

          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={(e) =>
              handleFileChange(e, setSelectedFile, handleSendMessage)
            }
            style={{ display: "none" }}
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <PaperClipOutlined style={{ fontSize: "20px" }} />
          </label>
          <div style={{position: "relative", top:-60, right: "-40%" }} className="flex items-center gap-2  p-2 rounded-md">
            {/* <InfoCircleOutlined style={{ fontSize: "16px" }} /> */}
            <span>{infoPermissions?.message}</span>
          </div>
          
          <Dropdown
            overlay={
              <EmojiDropdown
                emojiList={emojiList}
                onEmojiClick={handleEmojiClick}
              />
            }
            trigger={["click"]}
            visible={isEmojiPickerVisible}
            onVisibleChange={(visible) => setIsEmojiPickerVisible(visible)}
          >
            <button className="hover:text-blue-500" title="Chọn Emoji">
              <SmileOutlined style={{ fontSize: "20px" }} />
            </button>
          </Dropdown>
          <input
            type="file"
            accept="video/*"
            onChange={(e) =>
              handleVideoChange(e, setSelectedVideo, handleSendMessage)
            }
            style={{ display: "none" }}
            id="video-upload"
          />
          <label htmlFor="video-upload" className="cursor-pointer">
            <VideoCameraOutlined style={{ fontSize: "20px" }} />
          </label>
        </div>

        <div className="flex">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn"
            onPressEnter={sendMessage}
            className="rounded-full py-2 px-4 flex-1 mr-2"
          />
          <Button
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-400"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
