import React, { useState } from "react";
import { Input, Avatar, Badge } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import AddFriendModal from "./AddFriendModal";
import AddGroupModal from "./AddGroupModal";

const ChatSidebar = ({ chats, openChat }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalGroupVisible, setIsModalGroupVisible] = useState(false);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const openModalGroup = () => {
    setIsModalGroupVisible(true);
  };

  const closeModalGroup = () => {
    setIsModalGroupVisible(false);
  };

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
          <UserOutlined
            onClick={openModal}
            className="text-gray-500 text-lg cursor-pointer hover:text-blue-500"
          />
          {isModalVisible && <AddFriendModal onClose={closeModal} />}
        </div>
        <div className="flex gap-2 ml-2" onClick={openModalGroup}>
          <UsergroupAddOutlined className="text-gray-500 text-lg cursor-pointer hover:text-blue-500" />
        </div>

        {/* Add Group Modal */}
        {isModalGroupVisible && (
          <AddGroupModal
            visible={isModalGroupVisible}
            onClose={closeModalGroup}
          />
        )}
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
                <Badge count={0} size="small">
                  <Avatar
                    size="large"
                    src={chat.avt || "https://via.placeholder.com/150"}
                    icon={!chat.avt && <UserOutlined />}
                  />
                </Badge>
                <div className="w-48">
                  <div className="text-sm font-semibold leading-5 text-gray-800 truncate">
                    {chat.fullname || "Người dùng"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {chat.last_message || "Không có tin nhắn"}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(chat.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;