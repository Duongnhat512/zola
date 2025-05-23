import React, { useState } from "react";
import { Avatar, Button, Modal, Input, Tooltip } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  EditTwoTone,
  PhoneOutlined,
  UserAddOutlined,
  PlusCircleFilled,
  TeamOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import socket from "../../services/Socket";
import VideoCall from "../ChatApp/VideoCall";

const ChatHeader = ({ selectedChat, handleOpen, setIsInfoGroupVisible }) => {
  const userMain = useSelector((state) => state.user.user);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState(selectedChat?.name || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateNameGroup = () => {
    setNewGroupName(selectedChat?.name || "");
    setIsRenameModalVisible(true);
  };

  const handleRenameConfirm = async () => {
    setLoading(true);
    try {
      socket.emit("update_group_name", {
        conversation_id: selectedChat.conversation_id,
        name: newGroupName,
      });
    } catch (err) {
      console.error("Lỗi không đổi tên thành công");
    }
    setLoading(false);
    setIsRenameModalVisible(false);
  };

  return (
    <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between border-b">
      <div className="flex items-center">
        <Avatar src={selectedChat?.avatar || "/default-avatar.jpg"} size={45} />
        <div className="ml-3">
          <div className="flex items-center">
            <h2 className="font-medium text-base mr-2">{selectedChat?.name}</h2>
            {selectedChat?.type === "group" && (
              <Tooltip title="Đổi tên nhóm">
                <EditTwoTone onClick={handleUpdateNameGroup} className="cursor-pointer" />
              </Tooltip>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {selectedChat?.list_user_id?.length > 2
              ? `${selectedChat?.list_user_id?.length} thành viên`
              : "Vừa truy cập"}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {selectedChat.type !== 'private' && (
          <Tooltip title="Thành viên">
            <Button
              type="text"
              icon={
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  <TeamOutlined style={{ fontSize: '20px' }} />
                  <PlusOutlined
                    style={{
                      fontSize: '8px',
                      position: 'absolute',
                      top: -4,
                      right: -4,
                    }}
                  />
                </span>
              }
              onClick={handleOpen}
            />          </Tooltip>
        )}
        {selectedChat.type === 'private' && (
          <Tooltip title="Cuộc gọi thoại">
            <Button type="text" icon={<PhoneOutlined style={{ fontSize: '20px' }} />} onClick={handleOpen} />
          </Tooltip>
        )}

        <Tooltip title="Video Call">
          <Button type="text" icon={<VideoCameraOutlined style={{ fontSize: '20px' }} />} onClick={() => setShowVideoCall(true)} />
        </Tooltip>
        <Tooltip title="Tìm kiếm">
          <Button type="text" icon={<SearchOutlined style={{ fontSize: '20px' }} />} />
        </Tooltip>
        <Tooltip title="Thông tin hội thoại">
          <Button type="text" icon={<InfoCircleOutlined style={{ fontSize: '20px' }} />} onClick={() => setIsInfoGroupVisible((prev) => !prev)} />
        </Tooltip>

      </div>

      <Modal
        title="Đổi tên nhóm"
        open={isRenameModalVisible}
        onCancel={() => setIsRenameModalVisible(false)}
        onOk={handleRenameConfirm}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
        centered
      >
        <div className="text-center">
          <Avatar src={selectedChat?.avatar || "/default-avatar.jpg"} size={80} className="mx-auto mb-4" />
          <p className="text-gray-700 mb-3">
            Tên nhóm mới sẽ hiển thị với tất cả thành viên.
          </p>
          <Input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Nhập tên nhóm mới"
          />
        </div>
      </Modal>

      {showVideoCall && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl shadow-lg w-[480px]">
            <VideoCall
              userId={userMain.id}
              peerId={
                selectedChat?.list_user_id?.find((u) => u.user_id !== userMain.id)?.user_id
              }
            />
            <Button onClick={() => setShowVideoCall(false)} block className="mt-4">
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
