import React, { useEffect, useState } from "react";
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

const ChatHeader = ({ selectedChat, handleOpen, setIsInfoGroupVisible, messages,setActiveMessageId }) => {
  const userMain = useSelector((state) => state.user.user);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState(selectedChat?.name || "");
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentResult, setCurrentResult] = useState(0);
  const [userMainPermission, setUserMainPermission] = useState("");

  const handleUpdateNameGroup = () => {
    setNewGroupName(selectedChat?.name || "");
    setIsRenameModalVisible(true);
  };
  const handleSearch = (value) => {
    setSearchValue(value);
    if (!value.trim()) {
      setSearchResults([]);
      setCurrentResult(0);
      setActiveMessageId(null);
      return;
    }
    const results = messages
      .filter(
        (msg) =>
          msg.type === "text" &&
          msg.text &&
          msg.text.toLowerCase().includes(value.toLowerCase())
      )
      .map((msg) => msg.id);
    setSearchResults(results);
    setCurrentResult(0);
    setActiveMessageId(results[0] || null);

    if (results.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`msg-${results[0]}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  const gotoResult = (index) => {
    if (searchResults.length === 0) return;
    const newIndex = (index + searchResults.length) % searchResults.length;
    setCurrentResult(newIndex);
    setActiveMessageId(searchResults[newIndex]);
    const el = document.getElementById(`msg-${searchResults[newIndex]}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
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
  useEffect(() => {
    if (userMain && selectedChat) {
      const findPermission = selectedChat.list_user_id.find(
        (user) => user.user_id === userMain.id
      );
      if (findPermission) {
        setUserMainPermission(findPermission.permission);
      } else {
        setUserMainPermission("member");
      }
    }
  }, [userMain, selectedChat]) 
  return (
    <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between border-b">
      <div className="flex items-center">
        <Avatar src={selectedChat?.avatar || "/default-avatar.jpg"} size={45} />
        <div className="ml-3">
          <div className="flex items-center">
            <h2 className="font-medium text-base mr-2">{selectedChat?.name}</h2>
            {selectedChat?.type === "group" && (userMainPermission === "owner" || userMainPermission === "moderator") && (
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
        {/* {selectedChat.type === 'private' && (
          // <Tooltip title="Cuộc gọi thoại">
          //   <Button type="text" icon={<PhoneOutlined style={{ fontSize: '20px' }} />} onClick={handleOpen} />
          // </Tooltip>
        )} */}

        {/* <Tooltip title="Video Call">
          <Button type="text" icon={<VideoCameraOutlined style={{ fontSize: '20px' }} />} onClick={() => setShowVideoCall(true)} />
        </Tooltip> */}
        <Tooltip title="Tìm kiếm tin nhắn">
          <Input.Search
            allowClear
            placeholder="Tìm tin nhắn"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 180 }}
          />
        </Tooltip>
        {searchResults.length > 0 && (
          <div className="flex items-center ml-2">
            <Button
              size="small"
              onClick={() => gotoResult(currentResult - 1)}
              disabled={searchResults.length === 0}
              style={{ marginRight: 4 }}
            >
              {"<"}
            </Button>
            <span style={{ minWidth: 40, textAlign: "center" }}>
              {currentResult + 1}/{searchResults.length}
            </span>
            <Button
              size="small"
              onClick={() => gotoResult(currentResult + 1)}
              disabled={searchResults.length === 0}
              style={{ marginLeft: 4 }}
            >
              {">"}
            </Button>
          </div>
        )}
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
