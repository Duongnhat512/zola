import React, { useEffect, useState } from "react";
import ChatSidebar from "../../components/ChatApp/ChatSidebar";
import ChatWindow from "../../components/ChatApp/ChatWindow";
import socket from "../../services/Socket";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import "react-toastify/dist/ReactToastify.css"; // Import CSS cho Toastify
import { toast } from "react-toastify"; // Import react-toastify
const HomeDetails = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const user = useSelector((state) => state.user.user);
  const [isLoading, setIsLoading] = useState(false);
  const openChat = (chat) => {
    setSelectedChat(chat);
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
      console.log("Group created successfully:", data);
      // Thông báo cho người dùng về việc tạo nhóm thành công
      toast.success(`Nhóm ${data.conversation.name} đã được tạo thành công!`, {
        autoClose: 5000, // Thời gian tự động đóng sau 5 giây
        hideProgressBar: true, // Ẩn thanh tiến độ
        closeOnClick: true, // Đóng khi người dùng nhấn vào thông báo
        pauseOnHover: true, // Dừng khi hover
      });
      fetchConversations();
      // Đóng modal sau khi nhóm được tạo
     
    });
    socket.on("new_group", (data) => {
      console.log("New group notification received:", data);
      // Thông báo có nhóm mới
      toast.info("Bạn có nhóm mới!", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      fetchConversations();
    });
    socket.on("new_member", (data) => {
      console.log("New group notification received:", data);
      // Thông báo có nhóm mới
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
  useEffect(() => {
    socket.on("new_message", (msg) => {
      fetchConversations();
      console.log("New message notification received:", msg);
    });

    return () => {
      socket.off("new_message");
    };
  }, [selectedChat]);
  useEffect(() => {
    socket.on("message_sent", (msg) => {
      fetchConversations();
      console.log("New message notification received:", msg);
    });

    return () => {
      socket.off("message_sent");
    };
  }, [selectedChat]);
  return (
    <div className="flex h-screen w-full bg-gray-100">
      {isLoading && (
        <Spin
          size="large"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      )}
      <ChatSidebar chats={chats} openChat={openChat} />
      <ChatWindow
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />
    </div>
  );
};

export default HomeDetails;
