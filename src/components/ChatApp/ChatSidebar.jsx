import React from "react";
import { Input, Avatar, Badge } from "antd";
import { SearchOutlined, UserOutlined, DownloadOutlined } from "@ant-design/icons";

const ChatSidebar = ({ chats, openChat }) => {
  return (
      <div className="w-1/4 border-r border-gray-300 flex flex-col bg-white shadow-lg">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm"
            className="rounded-md"
          />
          <div className="flex gap-2 ml-2">
            <UserOutlined className="text-gray-500 text-lg cursor-pointer hover:text-blue-500" />
            <div className="w-8 h-8 rounded-full bg-gray-300 cursor-pointer hover:bg-gray-400" />
          </div>
        </div>

        {/* Notification */}
        <div className="bg-blue-50 p-3 text-xs text-blue-700">
          <div className="flex gap-2 items-start">
            <DownloadOutlined className="mt-0.5 text-blue-500" />
            <span>
              Khi đăng nhập Zalo Web trên nhiều trình duyệt, một số trò chuyện
              sẽ không đủ tin nhắn cũ.{" "}
              <a
                className="text-blue-500 font-semibold cursor-pointer hover:underline"
                href="#"
              >
                Tải Zalo PC để xem đầy đủ tin nhắn
              </a>
            </span>
          </div>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto flex-1">
          {chats.map((chat, idx) => (
            <div
              key={idx}
              className="px-4 py-3 border-b border-gray-100 hover:bg-gray-100 cursor-pointer transition-all duration-200"
              onClick={() => openChat(chat)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Badge count={chat.unread} size="small">
                    <Avatar size="large" icon={<UserOutlined />} />
                  </Badge>
                  <div className="w-48">
                    <div className="text-sm font-semibold leading-5 text-gray-800 truncate">
                      {chat.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {chat.msg}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {chat.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
};

export default ChatSidebar;
