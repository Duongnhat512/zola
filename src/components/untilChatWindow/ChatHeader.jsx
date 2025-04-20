import React from "react";
import { Avatar, Button } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  SearchOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const ChatHeader = ({ selectedChat, handleOpen, setIsInfoGroupVisible }) => {
  return (
    <div className="bg-white p-4 shadow flex items-center justify-between">
      <div className="flex items-center">
        <Avatar
          src={selectedChat?.avatar || "https://via.placeholder.com/150"}
          size="large"
          className="mr-3"
        />
        <div>
          <h2 className="font-semibold">{selectedChat?.name}</h2>
          {selectedChat?.list_user_id?.length > 2 ? (
            <p className="text-sm text-gray-500">
              {selectedChat?.list_user_id?.length} thành viên
            </p>
          ) : (
            <p className="text-sm text-gray-500">Vừa truy cập</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button className="flex gap-2 ml-2" onClick={handleOpen}>
          <UserOutlined className="text-gray-500 text-lg cursor-pointer hover:text-blue-500" />
        </Button>
        <button className="text-gray-600 hover:text-blue-500">
          <VideoCameraOutlined className="text-xl" title="Video call" />
        </button>
        <button className="text-gray-600 hover:text-blue-500">
          <SearchOutlined className="text-xl" title="Tìm kiếm" />
        </button>
        <button
          className="text-gray-600 hover:text-blue-500"
          onClick={() => setIsInfoGroupVisible((prev) => !prev)}
        >
          <InfoCircleOutlined className="text-xl" title="Thông tin hộp thoại" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;