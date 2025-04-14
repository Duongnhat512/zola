import React, { useEffect, useState } from "react";
import ChatSidebar from "../../components/ChatApp/ChatSidebar";
import ChatWindow from "../../components/ChatApp/ChatWindow";
import socket from "../../services/Socket";
import { getAllConversationById } from "../../services/Conversation";
import { useSelector } from "react-redux";
import { getUserById } from "../../services/UserService";

const HomeDetails = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const user = useSelector((state) => state.user.user);

  const openChat = (chat) => {
    setSelectedChat(chat);
  };

  const fetchConversations = async () => {
    try {
      const response = await getAllConversationById(user.id);
      if (response.status === "success") {
        fetchUserDetails(response.all_members); // Gọi hàm fetchUserDetails với danh sách hội thoại
      } else {
        console.error("Lỗi khi lấy danh sách hội thoại:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };
  const fetchUserDetails = async (chatList) => {
    console.log("Fetching user details...", chatList);

    try {
      
      const updatedChats = await Promise.all(
        chatList.map(async (chat) => {
          const response = await getUserById(
            chat.list_user_id[0]
          );
          if (response.status === "success") {
            return {
              ...chat,
              user: response.user,
            };
          }
          return chat; // Nếu lỗi, giữ nguyên dữ liệu cũ
        })
      );
      console.log("Updated Chats:", updatedChats);

      setChats(updatedChats); // Cập nhật danh sách chats
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };
  useEffect(() => {
    fetchConversations(); // Đợi fetchConversations hoàn tất
  }, []);

  return (
    <div className="flex h-screen w-full bg-gray-100">
      <ChatSidebar chats={chats} openChat={openChat}/>
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
