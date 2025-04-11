import React from "react";
import { SmileOutlined, SendOutlined } from "@ant-design/icons";
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
  PaperClipOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
const ChatWindow = ({
  selectedChat,
  messages,
  input,
  setInput,
  sendMessage,
}) => {
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Chọn một cuộc trò chuyện
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {selectedChat ? (
        <>
          <div className="bg-white p-4 shadow flex items-center justify-between">
            <div className="flex items-center">
              <Avatar src="/user1.jpg" size="large" className="mr-3" />
              <div>
                <h2 className="font-semibold">{selectedChat.name}</h2>
                <p className="text-sm text-gray-500">Vừa truy cập</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-blue-500">
                <PlusOutlined className="text-xl" title="Thêm bạn vào nhóm" />
              </button>
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
                  <Avatar src={msg.avatar} size="small" className="self-end" />
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
            {/* Hàng icon chức năng */}
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

            {/* Ô nhập và nút gửi */}
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
        </>
      ) : (
        <div className="flex items-center justify-center flex-col text-center flex-1">
          <h1 className="text-2xl font-semibold text-gray-800">
            Chào mừng đến với <span className="text-blue-600">Zalo PC</span>!
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-md">
            Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người
            thân, bạn bè được tối ưu hoá cho máy tính của bạn.
          </p>
          <MessageOutlined
            style={{ fontSize: "64px", color: "#4096ff" }}
            className="my-8"
          />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
