import React, { useState } from "react";
import { Input, Menu } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import AddFriendModal from "./AddFriendModal";
import AddGroupModal from "./AddGroupModal";
import ChatWindow from "./ChatWindow";
import FriendInvitations from "../../pages/Friend/FriendInvitations";
import FriendList from "../../pages/Friend/FriendList";
import GroupList from "../../pages/Group/GroupList";

const MainLayout = (
  {
    selectedChat,
    setSelectedChat,
    setChats,
    chats,
    isInfoGroupVisible,
    fetchConversations,
    setIsInfoGroupVisible,
    infoPermissions,
    isModalAddMemberVisible,
    setIsModalAddMemberVisible,
    messages,
    setMessages
  }
) => {
  const [layout, setLayout] = useState("default"); // State to manage layout type
  const menuItems = [
    {
      label: "Danh sách bạn bè",
      key: "1",
      icon: <UserOutlined />,
      onClick: () => {
        // Handle click event for "Danh sách bạn bè"
        setLayout("default");
      },
    },
    {
      label: "Danh sách nhóm và cộng đồng", key: "2", icon: <TeamOutlined />,
      onClick: () => {
        // Handle click event for "Danh sách nhóm và cộng đồng"
        setLayout("group-list");
      },
    },
    {
      label: "Lời mời kết bạn",
      key: "3",
      icon: <UserOutlined />,
      onClick: () => {
        // Handle click event for "Lời mời kết bạn"
        setLayout("friend-invitations");
      },
    },

  ];
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };
  const [isModalGroupVisible, setIsModalGroupVisible] = useState(false);

  const openModalGroup = () => {
    setIsModalGroupVisible(true);
  };

  const closeModalGroup = () => {
    setIsModalGroupVisible(false);
  };


  return (
    <div className="flex h-screen w-full bg-gray-100">
      <div className="w-1/4 border-r border-gray-300 flex flex-col bg-white shadow-lg">
        {/* Left Sidebar */}
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
        <Menu
          mode="inline"
          items={menuItems}
          className="border-none"
          defaultSelectedKeys={["1"]}
        />

        {/* Main Content */}
      </div>
      <div className="flex-1 p-4 bg-gray-50">
        {layout === "default" ? (
          <FriendList fetchConversations={fetchConversations}
            infoPermissions={infoPermissions}
            isModalAddMemberVisible={isModalAddMemberVisible}
            setIsModalAddMemberVisible={setIsModalAddMemberVisible}
            selectedChat={selectedChat}
            setChats={setChats}
            setMessages={setMessages}
            messages={messages}
            setSelectedChat={setSelectedChat}
            setIsInfoGroupVisible={setIsInfoGroupVisible}
            isModalGroupVisible={isModalGroupVisible}
            chats={chats}
            isInfoGroupVisible={isInfoGroupVisible}
          />
        ) : layout === "friend-invitations" ? (
          <FriendInvitations />
        ) : (
          <GroupList />
        )}
      </div>


    </div>
  );
};

export default MainLayout;
