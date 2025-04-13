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
import FriendInvitations from "../../pages/Group/FriendInvitations";
import FriendList from "../../pages/Group/FriendList";

const MainLayout = () => {
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
    { label: "Danh sách nhóm và cộng đồng", key: "2", icon: <TeamOutlined /> },
    {
      label: "Lời mời kết bạn",
      key: "3",
      icon: <UserOutlined />,
      onClick: () => {
        // Handle click event for "Lời mời kết bạn"
        setLayout("friend-invitations");
      },
    },
    {
      label: "Lời mời vào nhóm và cộng đồng",
      key: "4",
      icon: <UsergroupAddOutlined />,
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
      {layout === "default" ? (
        <div className="flex-1 p-4 bg-gray-50">
          <FriendList />
        </div>
      ) : (
        <div className="flex-1 p-4 bg-gray-50">
          <FriendInvitations />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
