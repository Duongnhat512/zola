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
  const [chats, setChats] = useState([
    {
      user_id: "c6c7efab-5a27-45bd-938e-b14b6e80f409",
      created_at: "2025-04-13T15:12:22.364Z",
      id: "f58979ec-f3b6-4b0a-8393-c06c94c8701f",
      conversation_id: "1cbc07fc-5918-4d46-9da3-e6b2418f49da",
    },
  ]);
  const user = useSelector((state) => state.user.user);
  const messagesData = {
    "Nguyễn Văn A": Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      sender: i % 2 === 0 ? "me" : "other",
      avatar: "/user1.jpg",
      text:
        i % 2 === 0
          ? `Tin nhắn từ tôi ${i + 1}`
          : `Tin nhắn từ Nguyễn Văn A ${i + 1}`,
      time: new Date(Date.now() - i * 60000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    "Nhóm Dự Án ReactJS": Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      sender: i % 3 === 0 ? "me" : "other",
      avatar: "/group.jpg",
      text:
        i % 3 === 0
          ? `Tin nhắn từ tôi ${i + 1}`
          : `Tin nhắn từ thành viên nhóm ${i + 1}`,
      time: new Date(Date.now() - i * 120000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    "Trần Thị B": Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      sender: i % 2 === 0 ? "me" : "other",
      avatar: "/user2.jpg",
      text:
        i % 2 === 0
          ? `Tin nhắn từ tôi ${i + 1}`
          : `Tin nhắn từ Trần Thị B ${i + 1}`,
      time: new Date(Date.now() - i * 90000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    "Nhóm Học Tập": Array.from({ length: 28 }, (_, i) => ({
      id: i + 1,
      sender: i % 3 === 0 ? "me" : "other",
      avatar: "/group.jpg",
      text:
        i % 3 === 0
          ? `Tin nhắn từ tôi ${i + 1}`
          : `Tin nhắn từ thành viên nhóm ${i + 1}`,
      time: new Date(Date.now() - i * 150000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    "Nguyễn Văn C": Array.from({ length: 22 }, (_, i) => ({
      id: i + 1,
      sender: i % 2 === 0 ? "me" : "other",
      avatar: "/user3.jpg",
      text:
        i % 2 === 0
          ? `Tin nhắn từ tôi ${i + 1}`
          : `Tin nhắn từ Nguyễn Văn C ${i + 1}`,
      time: new Date(Date.now() - i * 70000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    "Nhóm Công Nghệ Mới": Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      sender: i % 3 === 0 ? "me" : "other",
      avatar: "/group.jpg",
      text:
        i % 3 === 0
          ? `Tin nhắn từ tôi ${i + 1}`
          : `Tin nhắn từ thành viên nhóm ${i + 1}`,
      time: new Date(Date.now() - i * 180000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    "Phạm Văn D": Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      sender: i % 2 === 0 ? "me" : "other",
      avatar: "/user4.jpg",
      text:
        i % 2 === 0
          ? `Tin nhắn từ tôi ${i + 1}`
          : `Tin nhắn từ Phạm Văn D ${i + 1}`,
      time: new Date(Date.now() - i * 60000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    "Nhóm Thể Thao": Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      sender: i % 3 === 0 ? "me" : "other",
      avatar: "/group.jpg",
      text:
        i % 3 === 0
          ? `Tin nhắn từ tôi ${i + 1}`
          : `Tin nhắn từ thành viên nhóm ${i + 1}`,
      time: new Date(Date.now() - i * 200000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    "Lê Thị E": Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      sender: i % 2 === 0 ? "me" : "other",
      avatar: "/user5.jpg",
      text:
        i % 2 === 0
          ? `Tin nhắn từ tôi ${i + 1}`
          : `Tin nhắn từ Lê Thị E ${i + 1}`,
      time: new Date(Date.now() - i * 80000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
  };
  const openChat = (chat) => {
    setSelectedChat(chat);
    setMessages(messagesData[chat.name] || []);
  };

  const fetchConversations = async () => {
    try {
      const response = await getAllConversationById(user.id); // Thay bằng URL API của bạn
      console.log("Conversations:", response);
      if (response.status === "success") {
        
        // setChats(response.conversations);
      } else {
        console.error("Lỗi khi lấy danh sách hội thoại:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };
  const fetchUserDetails = async () => {
    try {
      const updatedChats = await Promise.all(
        chats.map(async (chat) => {
          console.log(chat);
          
          const response = await getUserById(chat.user_id); // Gọi API với user_id
          console.log(response);
          if (response.status === "success") {
            return {
              ...chat,
              user:response.user
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
    fetchConversations();
    fetchUserDetails()
  }, []);

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* <ChatSidebar
        onSelectChat={(chat) => {
          setSelectedChat(chat);
          // Gửi yêu cầu lấy tin nhắn cho hội thoại được chọn
          socket.emit("get_messages", { conversation_id: chat.id });

          socket.once("message_list", (data) => {
            setMessages(data);
          });
        }}
      />
      <ChatWindow
        selectedChat={selectedChat}
        messages={messages}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
      /> */}
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
