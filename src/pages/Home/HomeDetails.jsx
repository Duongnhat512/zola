import React, { useEffect, useState } from "react";
import ChatSidebar from "../../components/ChatApp/ChatSidebar";
import ChatWindow from "../../components/ChatApp/ChatWindow";
import socket from "../../services/Socket";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import "react-toastify/dist/ReactToastify.css"; // Import CSS cho Toastify
import { toast } from "react-toastify"; // Import react-toastify
import InfoGroup from "../Group/InfoGroup";
const HomeDetails = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const user = useSelector((state) => state.user.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoGroupVisible, setIsInfoGroupVisible] = useState(false);
  const openChat = (chat) => {
    setSelectedChat(chat);

    // Đặt badge về 0 khi mở cuộc trò chuyện
    setChats((prevChats) =>
      prevChats.map((c) =>
        c.conversation_id === chat.conversation_id
          ? { ...c, unread_count: 0 }
          : c
      )
    );
  };
  const fetchConversations = () => {
    socket.emit("get_conversations", { user_id: user.id });
    socket.on("conversations", (response) => {
      if (response.status === "success") {
        console.log("Conversations:", response.conversations);
        
        setChats(response.conversations);
      } else {
        console.error("Lỗi khi lấy danh sách hội thoại:", response.message);
      }
    });
    return () => {
      socket.off("conversations");
    };
  };
  useEffect(() => {
    setIsLoading(true);
    fetchConversations();
    setIsLoading(false);
  }, []);
  useEffect(() => {
    socket.on("group_created", (data) => {
      toast.success(`Nhóm ${data.conversation.name} đã được tạo thành công!`, {
        autoClose: 5000, // Thời gian tự động đóng sau 5 giây
        hideProgressBar: true, // Ẩn thanh tiến độ
        closeOnClick: true, // Đóng khi người dùng nhấn vào thông báo
        pauseOnHover: true, // Dừng khi hover
      });
      fetchConversations();
    });
    socket.on("new_group", (data) => {
      toast.info("Bạn có nhóm mới!", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      fetchConversations();
    });
    socket.on("new_member", (data) => {
      toast.info("Bạn có nhóm mới!", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      fetchConversations();
    });
    socket.on("remove_member", (data) => {
      console.log("Remove notification received:", data);
      // Thông báo có nhóm mới
      toast.info("Bạn vừa bị xóa khỏi nhóm!", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      fetchConversations();
    });
    socket.on("error", (data) => {
      // Thông báo có nhóm mới
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    });
  }, [socket]);
  return isLoading ? (
    <div className="flex h-screen w-full bg-gray-100">
      <Spin
        size="large"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  ) : (
    <div className="flex h-screen w-full bg-gray-100">
      <ChatSidebar chats={chats} openChat={openChat} />
      <ChatWindow
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        setChats={setChats}
        chats={chats}
        fetchConversations={fetchConversations}
        setIsInfoGroupVisible={setIsInfoGroupVisible}
        isInfoGroupVisible={isInfoGroupVisible}
      />
      {isInfoGroupVisible && (
        <InfoGroup
          selectedChat={selectedChat}
          onClose={() => setIsInfoGroupVisible(false)}
        />
      )}
    </div>
  );
};

export default HomeDetails;
