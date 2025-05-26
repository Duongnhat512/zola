import React, { useState } from "react";
import { Menu } from "antd";
import {
  MessageOutlined,
  TeamOutlined,
  FileOutlined,
  CloudSyncOutlined,
  CloudFilled,
  ToolFilled,
  SettingFilled,
  UserOutlined,
} from "@ant-design/icons";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItemsTop = [
    { label: "Tin nhắn", key: "1", icon: <MessageOutlined /> },
    { label: "Team", key: "2", icon: <TeamOutlined /> },
  ];

  const menuItemsBottom = [
    // { label: "Zola Cloud", key: "4", icon: <CloudSyncOutlined /> },
    // { label: "Cloud của tôi", key: "5", icon: <CloudFilled /> },
    // { label: "Công cụ", key: "6", icon: <ToolFilled /> },
    { label: "Cài đặt", key: "7", icon: <SettingFilled /> },
  ];

  return (
    <div
      className={`h-screen bg-blue-600 text-white flex flex-col ${collapsed ? "w-16" : "w-64"
        } transition-all duration-300`}
    >
      <div className="flex items-center justify-center py-4">
        <UserOutlined className="text-3xl" />
      </div>

      <Menu
        theme="dark"
        mode="inline"
        items={menuItemsTop}
        className="bg-blue-600 border-none flex-1"
      />

      <Menu
        theme="dark"
        mode="inline"
        items={menuItemsBottom}
        className="bg-blue-600 border-none"
      />

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 m-4 rounded-md"
      >
        {collapsed ? "Mở rộng" : "Thu gọn"}
      </button>
    </div>
  );
};

export default Sidebar;
