import React, { useEffect, useState } from "react";
import { Input, Avatar, Badge, Dropdown, Menu } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import AddFriendModal from "./AddFriendModal";
import AddGroupModal from "./AddGroupModal";
import socket from "../../services/Socket";
import { useSelector } from "react-redux";
import { Modal, message as AntMessage } from "antd";

const ChatSidebar = ({
  chats,
  openChat,
  isModalGroupVisible,
  setIsModalGroupVisible,
  setChats,
  selectedChat, // Thêm prop này
  setMessages,   // Thêm prop này
  setSelectedChat
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredChats, setFilteredChats] = useState(chats); // danh sách hiển thị
  const [hoveredId, setHoveredId] = useState(null);
  const user = useSelector(state => state.user.user); // Lấy user từ redux

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);
  const openModalGroup = () => setIsModalGroupVisible(true);
  const closeModalGroup = () => setIsModalGroupVisible(false);
  useEffect(() => {
    socket.on("delete_history_for_me_success", ({ conversation_id }) => {
      AntMessage.success("Đã xóa lịch sử hội thoại!");
      if (setChats) {
        setChats(prev => prev.filter(chat => chat.conversation_id !== conversation_id));
      }
    });
    return () => socket.off("delete_history_for_me_success");
  }, [setChats]);
  const handleDeleteChat = (chat) => {
    if (selectedChat && selectedChat.conversation_id === chat.conversation_id) {
      if (setMessages) setMessages([]);
      if (setSelectedChat) setSelectedChat(null);
    }
    socket.emit("delete_history_for_me", {
      user_id: user.id,
      conversation_id: chat.conversation_id,
    });
  };
  // Dropdown menu
  const getMenu = (chat) => (
    <Menu>
      <Menu.Item key="unread" onClick={e => { e.domEvent.stopPropagation(); /* Đánh dấu chưa đọc */ }}>
        Đánh dấu chưa đọc
      </Menu.Item>
      <Menu.Item key="hide" onClick={e => { e.domEvent.stopPropagation(); /* Ẩn trò chuyện */ }}>
        Ẩn trò chuyện
      </Menu.Item>
      <Menu.Item
        key="delete"
        danger
        onClick={e => {
          handleDeleteChat(chat);
        }}
      >
        Xóa hộp thoại
      </Menu.Item>
    </Menu>
  );


  useEffect(() => {
    // Cập nhật lại danh sách mỗi khi `chats` từ props thay đổi (ví dụ do socket)
    setFilteredChats(chats);
  }, [chats, user.id]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat =>
        chat.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [search, chats]);


  return (
    <div
      className="w-1/4 border-r border-gray-300 flex flex-col bg-white shadow-lg "
      style={{ width: "320px" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <Input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm"
          className="rounded-md"
        />

        <div className="flex gap-2 ml-2">
          <UserOutlined
            onClick={openModal}
            className="text-gray-500 text-lg cursor-pointer hover:text-blue-500"
          />
          {isModalVisible && (
            <AddFriendModal
              onClose={closeModal}
              isModalVisible={isModalVisible}
            />
          )}
        </div>
        <div className="flex gap-2 ml-2" onClick={openModalGroup}>
          <UsergroupAddOutlined className="text-gray-500 text-lg cursor-pointer hover:text-blue-500" />
        </div>
        {isModalGroupVisible && (
          <AddGroupModal
            visible={isModalGroupVisible}
            onClose={closeModalGroup}
          />
        )}
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto flex-1">
        {filteredChats.map((chat) => (
          <div
            key={chat.conversation_id}
            className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-all duration-200
            ${selectedChat?.conversation_id === chat.conversation_id ? "bg-gray-100" : "hover:bg-gray-100"}
          `} onClick={() => openChat(chat)}
            onMouseEnter={() => setHoveredId(chat.conversation_id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              height: "100px",
              margin: "0 auto",
              display: "flex",
            }}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3">
                <Badge count={chat?.unread_count || 0} size="small">
                  <Avatar
                    size="large"
                    src={chat?.avatar || "/default-avatar.jpg"}
                    icon={!chat?.avatar && <UserOutlined />}
                  />
                </Badge>
                <div className="w-48">
                  <div className="text-sm font-semibold leading-5 text-gray-800 truncate">
                    {chat?.name || "Người dùng"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {chat?.last_message?.type === "image" ? (
                      <span className="text-gray-400">Đã gửi một ảnh</span>
                    ) : chat?.last_message?.type === "document" ? (
                      <span className="text-gray-400">Đã gửi một tệp</span>
                    ) : chat?.last_message?.type === "video" ? (
                      <span className="text-gray-400">Đã gửi một video</span>
                    ) : (
                      <span className="text-gray-400">
                        {chat.last_message?.message
                          ? "Đã gửi một tin nhắn"
                          : "Không có tin nhắn"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "11px" }} className="text-gray-400 whitespace-nowrap">
                {hoveredId === chat.conversation_id ? (
                  <Dropdown overlay={getMenu(chat)} trigger={['click']}>
                    <span
                      onClick={e => e.stopPropagation()} // Thêm dòng này để ngăn click lan lên cha
                    >
                      <MoreOutlined className="text-xl cursor-pointer" />
                    </span>
                  </Dropdown>
                ) : (
                  chat?.last_message?.created_at
                    ? new Date(chat?.last_message?.created_at).toLocaleString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                    : ""
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;