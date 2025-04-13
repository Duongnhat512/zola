import React, { useEffect, useState } from "react";
import { SmileOutlined, SendOutlined } from "@ant-design/icons";
import { Input, Avatar, Button } from "antd";
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

const ChatWindow = ({
  selectedChat,
  messages,
  setMessages,
  input,
  setInput,
}) => {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);

  // useEffect(() => {

  //   if (selectedChat?.conversation_id) {
  //     // Gửi yêu cầu lấy lịch sử tin nhắn qua socket
  //     socket.emit("get_messages", { conversation_id: selectedChat.conversation_id });

  //     // Lắng nghe sự kiện trả về danh sách tin nhắn
  //     socket.on("message_list", (data) => {
  //       setMessages(data);
  //     });

  //     // Dọn dẹp sự kiện khi component unmount hoặc khi conversation_id thay đổi
  //     return () => {
  //       socket.off("message_list");
  //     };
  //   }
  // }, [selectedChat?.conversation_id, setMessages]);
  useEffect(() => {
    console.log("Socket connected:", socket.connected); // Kiểm tra trạng thái kết nối
    try {
      socket.on("connect", () => {
        console.log("Socket connected successfully");
      });
      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  }, []);
  const sendMessage = () => {
    if (!input.trim()) return;

    const msg = {
      conversation_id: selectedChat?.conversation_id || "default-id",
      receiver_id: selectedChat?.user_id || "default-receiver",
      message: input,
      type: "text",
      status: "sent",
    };

    // Gửi tin nhắn qua socket
    socket.emit("send_message", msg);

    // Cập nhật tin nhắn vào danh sách
    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        sender: "me",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    // Xóa nội dung trong ô nhập
    setInput("");
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
      {/* Header */}
      <div className="bg-white p-4 shadow flex items-center justify-between">
        <div className="flex items-center">
          <Avatar
            src={selectedChat.avatar || "/default-avatar.jpg"}
            size="large"
            className="mr-3"
          />
          <div>
            <h2 className="font-semibold">{selectedChat.name}</h2>
            <p className="text-sm text-gray-500">Vừa truy cập</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowAddFriendModal(true)}
            className="flex gap-2 ml-2"
          >
            <UserOutlined className="text-gray-500 text-lg cursor-pointer hover:text-blue-500" />
          </Button>
          <button className="text-gray-600 hover:text-blue-500">
            <VideoCameraOutlined className="text-xl" title="Video call" />
          </button>
          <button className="text-gray-600 hover:text-blue-500">
            <SearchOutlined className="text-xl" title="Tìm kiếm" />
          </button>
          <button className="text-gray-600 hover:text-blue-500">
            <InfoCircleOutlined
              className="text-xl"
              title="Thông tin hộp thoại"
            />
          </button>
        </div>
      </div>

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "items-start"
            } gap-2`}
          >
            {msg.sender !== "me" && (
              <Avatar
                src={msg.avatar || "/default-avatar.jpg"}
                size="small"
                className="self-end"
              />
            )}
            <div
              className={`flex flex-col items-${
                msg.sender === "me" ? "end" : "start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-xs whitespace-pre-line ${
                  msg.sender === "me"
                    ? "bg-blue-100 text-right"
                    : "bg-white shadow"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-xs text-gray-500 mt-1">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input and send button */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-4 mb-2 text-gray-600">
          <button className="hover:text-blue-500" title="Gửi ảnh">
            <PictureOutlined style={{ fontSize: "20px" }} />
          </button>
          <button className="hover:text-blue-500" title="Gửi sticker">
            <SmileOutlined style={{ fontSize: "20px" }} />
          </button>
          <button className="hover:text-blue-500" title="Gửi file">
            <PaperClipOutlined style={{ fontSize: "20px" }} />
          </button>
          <button className="hover:text-blue-500" title="Tạo tài liệu">
            <FileTextOutlined style={{ fontSize: "20px" }} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none"
            placeholder={`Nhập @, tin nhắn tới ${selectedChat.name}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 flex items-center gap-1"
            onClick={sendMessage}
          >
            <SendOutlined />
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
