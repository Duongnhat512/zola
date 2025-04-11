import React, { useState } from "react";
import { Input, Avatar, Badge } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  DownloadOutlined,
  MessageOutlined,
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  SmileOutlined,
  PaperClipOutlined,
  FileTextOutlined,
  SendOutlined, // Import biểu tượng SendOutlined
} from "@ant-design/icons";
import ChatSidebar from "../../components/ChatApp/ChatSidebar";
import ChatWindow from "../../components/ChatApp/ChatWindow";

const HomeDetails = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chats = [
    {
      name: "Nguyễn Văn A",
      msg: "Bạn đã nhận được tài liệu chưa? Đây là tài liệu rất quan trọng, vui lòng kiểm tra lại.",
      time: "1 phút trước",
      group: false,
      unread: 2,
    },
    {
      name: "Nhóm Dự Án ReactJS",
      msg: "Mọi người nhớ hoàn thành task trước thứ 6 nhé! Đừng quên cập nhật tiến độ.",
      time: "5 phút trước",
      group: true,
      unread: 8,
    },
    {
      name: "Trần Thị B",
      msg: "Cảm ơn bạn nhiều nhé! Hẹn gặp lại bạn vào tuần sau.",
      time: "10 phút trước",
      group: false,
      unread: 0,
    },
    {
      name: "Nhóm Học Tập",
      msg: "Ai có thể giải bài tập này giúp mình không? Mình đang gặp khó khăn với bài số 3.",
      time: "30 phút trước",
      group: true,
      unread: 3,
    },
    {
      name: "Nguyễn Văn C",
      msg: "Hôm nay bạn có rảnh không? Mình muốn mời bạn đi uống cà phê.",
      time: "1 giờ trước",
      group: false,
      unread: 1,
    },
    {
      name: "Nhóm Công Nghệ Mới",
      msg: "Đừng quên buổi họp vào lúc 3 giờ chiều mai. Chúng ta sẽ thảo luận về dự án mới.",
      time: "2 giờ trước",
      group: true,
      unread: 5,
    },
    {
      name: "Phạm Văn D",
      msg: "Tôi đã gửi email cho bạn rồi nhé. Vui lòng kiểm tra và phản hồi sớm.",
      time: "5 giờ trước",
      group: false,
      unread: 0,
    },
    {
      name: "Nhóm Thể Thao",
      msg: "Cuối tuần này có trận bóng, ai tham gia không? Đăng ký sớm để chuẩn bị.",
      time: "1 ngày trước",
      group: true,
      unread: 2,
    },
    {
      name: "Lê Thị E",
      msg: "Chúc bạn một ngày tốt lành! Hãy luôn giữ nụ cười trên môi.",
      time: "2 ngày trước",
      group: false,
      unread: 0,
    },
  ];
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
  const sendMessage = () => {
    if (input.trim() === "") return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: "me",
        text: input,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInput("");
  };
  return (
    <div className="flex h-screen w-full bg-gray-100">
      <ChatSidebar chats={chats} openChat={openChat} />
      <ChatWindow
        selectedChat={selectedChat}
        messages={messages}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
      />
    </div>
  );
};

export default HomeDetails;
