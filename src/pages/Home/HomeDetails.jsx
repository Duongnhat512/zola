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
    const handleGroupCreated = (data) => {
      toast.success(`Nhóm ${data.conversation.name} đã được tạo thành công!`, {
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
      fetchConversations();
    };
  
    const handleNewGroup = (data) => {
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      fetchConversations();
    };
  
    const handleRemovedMember = (data) => {
      console.log("Removed notification received:", data);
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      fetchConversations();
      if (selectedChat?.conversation_id === data.conversation_id) {
        setSelectedChat(null);
      }
    };
  
    const handleError = (data) => {
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    };
  
    const handleAddMember = (data) => {
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      if (selectedChat?.conversation_id === data.conversation_id) {
        setSelectedChat((prev) => {
          // Tránh thêm trùng user_id nếu đã có
          const updatedList = prev.list_user_id.includes(data.user_id)
            ? prev.list_user_id
            : [...prev.list_user_id, data.user_id];
    
          return {
            ...prev,
            list_user_id: updatedList,
          };
        });
      }
    };
    
  
    // Đăng ký sự kiện
    socket.on("group_created", handleGroupCreated);
    socket.on("new_group", handleNewGroup);
    socket.on("removed_member", handleRemovedMember);
    socket.on("error", handleError);
    socket.on("add_member", handleAddMember);
  
    // Cleanup
    return () => {
      socket.off("group_created", handleGroupCreated);
      socket.off("new_group", handleNewGroup);
      socket.off("removed_member", handleRemovedMember);
      socket.off("error", handleError);
      socket.off("add_member", handleAddMember);
    };
  }, [socket]);
  

  useEffect(() => {
    socket.on("remove_member", (data) => {
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      console.log("Remove notification received:", data);
      fetchConversations();
      if (selectedChat?.conversation_id === data.conversation_id) {
        
        setSelectedChat((prev) => ({
          ...prev,
          list_user_id: prev.list_user_id.filter((id) => id !== data.user_id),
        }));
      }        
    });
  },[socket]);
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
