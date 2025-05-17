import React, { useState } from "react";
import { Avatar, Button, Modal } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  EditTwoTone,
} from "@ant-design/icons";
import socket from "../../services/Socket";

const ChatHeader = ({ selectedChat, handleOpen, setIsInfoGroupVisible }) => {
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState(selectedChat?.name || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateNameGroup = () => {
    setNewGroupName(selectedChat?.name || "");
    setIsRenameModalVisible(true);
  };

  const handleRenameCancel = () => {
    setIsRenameModalVisible(false);
  };

  const handleRenameConfirm = async () => {
    setLoading(true);
    // TODO: Call API or socket to update group name here
    // Example: await updateGroupName(selectedChat.conversation_id, newGroupName);
    try {
      socket.emit("update_group_name", {
        conversation_id: selectedChat.conversation_id,
        name: newGroupName
      })
    } catch (err) {
      console.error("Lỗi không đổi tên thành công");
    }
    setLoading(false);
    setIsRenameModalVisible(false);
  };

  return (
    <div className="bg-white p-4 shadow flex items-center justify-between">
      <div className="flex items-center">
        <Avatar
          src={selectedChat?.avatar || "/default-avatar.jpg"}
          size="large"
          className="mr-3"
        />
        <div>
          <h2 id="name" className="font-semibold">{selectedChat?.name}

            {selectedChat?.list_user_id?.length > 2 ? (
              <Button className="border-0 text-xs" onClick={handleUpdateNameGroup}>
                <EditTwoTone />
              </Button>

            ) : (
              <div></div>
            )}
          </h2>
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
      <Modal
        title="Đổi tên nhóm"
        open={isRenameModalVisible}
        onCancel={handleRenameCancel}
        onOk={handleRenameConfirm}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
        centered
      >
        <Avatar
          src={selectedChat?.avatar || "/default-avatar.jpg"}
          size={100}
          className="mx-auto mb-4"
        />
        <div className="mb-3 text-black font-semibold text-base text-center">
          Bạn có chắc chắn muốn đổi tên nhóm, khi xác nhận tên nhóm mới sẽ hiển thị với tất cả thành viên.
        </div>
        <input
          className="w-full border rounded px-3 py-2 text-center text-base"
          value={newGroupName}
          onChange={e => setNewGroupName(e.target.value)}
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default ChatHeader;