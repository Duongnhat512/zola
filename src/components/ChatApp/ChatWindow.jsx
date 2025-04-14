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
import { useSelector } from "react-redux";

const ChatWindow = ({
  selectedChat,
  input,
  setInput,
  messages,
  setMessages,
}) => {
  const userMain = useSelector((state) => state.user.user);
  useEffect(() => {
    console.log("Selected chat:", selectedChat);
    
    if (!selectedChat?.conversation_id) return;
    // Gửi yêu cầu lấy danh sách tin nhắn khi chọn đoạn chat
    socket.emit("get_messages", {
      conversation_id: selectedChat.conversation_id,
    });
    // Nhận danh sách tin nhắn
    socket.on("list_messages", (data) => {
      const dataSort = data.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      const formattedMessages = dataSort.map((msg) => ({
        id: msg.message_id,
        sender: msg.sender_id === userMain.id ? "me" : "other",
        avatar:
          msg.sender_id === userMain.id
            ? userMain.avatar || "/default-avatar.jpg"
            : selectedChat.user.avt || "/default-avatar.jpg",
        text: msg.message,
        time: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(formattedMessages);
    });

    // Khi nhận tin nhắn mới từ server
    socket.emit("new_message", (msg) => {
      console.log("New message received:", msg);

      const isCurrentChat =
        msg.sender_id === selectedChat.user_id ||
        msg.receiver_id === selectedChat.user_id;
      console.log("Is current chat:", isCurrentChat);

      if (!isCurrentChat) return; // Nếu không phải đoạn chat hiện tại thì bỏ qua

      setMessages((prev) => [
        ...prev,
        {
          id: msg.message_id,
          sender: msg.sender_id === userMain.id ? "me" : "other",
          avatar:
            msg.sender_id === userMain.id
              ? userMain.avatar || "/default-avatar.jpg"
              : selectedChat.user.avt || "/default-avatar.jpg",
          text: msg.message,
          time: new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    });
    return () => {
      socket.off("list_messages");
      socket.off("new_message");
    };
  }, [selectedChat?.conversation_id, selectedChat?.user_id, userMain.id]);
  const sendMessage = () => {
    if (!input.trim()) return;

    const msg = {
      receiver_id: selectedChat?.user_id || "default-receiver",
      message: input,
      type: "text",
      status: "sent",
    };
    socket.emit("send_private_message", msg, (response) => {
      if (response.status === "success") {
        console.log("Message sent successfully:", response);
        setMessages((prev) => [
          ...prev,
          {
            id: msg.message_id,
            sender: msg.sender_id === userMain.id ? "me" : "other",
            avatar:
              msg.sender_id === userMain.id
                ? userMain.avatar || "/default-avatar.jpg"
                : selectedChat.user.avt || "/default-avatar.jpg",
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } else {
        console.error("Failed to send message:", response.error);
      }
    });
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`, // Tạo ID tạm thời cho tin nhắn
        sender: "me",
        avatar: userMain.avatar || "/default-avatar.jpg", // Avatar của người gửi
        text: input, // Nội dung tin nhắn
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "pending",
      },
    ]);

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
  console.log("Selected chat:", selectedChat);
  
  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="bg-white p-4 shadow flex items-center justify-between">
        <div className="flex items-center">
          <Avatar
            src={selectedChat?.user?.avt || "/default-avatar.jpg"}
            size="large"
            className="mr-3"
          />
          <div>
            <h2 className="font-semibold">{selectedChat.user.fullname}</h2>
            <p className="text-sm text-gray-500">Vừa truy cập</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button className="flex gap-2 ml-2">
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
          <button className="hover:text-blue-500" title="Gửi tài liệu">
            <FileTextOutlined style={{ fontSize: "20px" }} />
          </button>
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
            onClick={sendMessage}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-400"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
