import React, { useEffect, useState } from "react";
import ChatSidebar from "../../components/ChatApp/ChatSidebar";
import ChatWindow from "../../components/ChatApp/ChatWindow";
import socket from "../../services/Socket";
import {
  getAllConversationById,
  getAllMemberByConversationId,
  getConversation,
} from "../../services/Conversation";
import { useSelector } from "react-redux";
import { getUserById } from "../../services/UserService";
import { Spin } from "antd";

const HomeDetails = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const user = useSelector((state) => state.user.user);
  const [isLoading, setIsLoading] = useState(false);
  const openChat = (chat) => {
    setSelectedChat(chat);
  };
  const fetchConversations = async () => {
    setIsLoading(true); 
    try {
      const response = await getAllConversationById(user.id);
      console.log("Conversations:", response);
      if (response.status === "success") {
        fetchUserDetails(response.all_members); 
      } else {
        console.error("Lỗi khi lấy danh sách hội thoại:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API fetchConversations:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchUserDetails = async (chatList) => {
    console.log("Fetching user details...", chatList);

    try {
      const updatedChats = await Promise.all(
        chatList.map(async (chat) => {
          console.log("Fetching user details for chat:", chat.list_user_id[0]);
          const response = await getUserById(chat.list_user_id[0]);
          if (response.status === "success") {
            return {
              ...chat,
              user: response.user,
            };
          }
        })
      );
      console.log("Updated Chats:", updatedChats);

      setChats(updatedChats); // Cập nhật danh sách chats
    } catch (error) {
      console.error("Lỗi khi xử lý danh sách chats:", error);
      return chats;
    }
  };

  useEffect(() => {
    fetchConversations(); // Đợi fetchConversations hoàn tất
  }, []);

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {isLoading && (
        <Spin size="large" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      )}
      <ChatSidebar chats={chats} openChat={openChat} />
      <ChatWindow
        chat={selectedChat}
        messages={messages}
        input={input}
        setInput={setInput}
        setMessages={setMessages}
        setSelectedChat={setSelectedChat}
        selectedChat={selectedChat}
        setChats={setChats}
      />
    </div>
  );
};

export default HomeDetails;
