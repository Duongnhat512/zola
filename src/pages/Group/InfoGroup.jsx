import React, { useEffect, useState } from "react";
import { Avatar, Button, Collapse, Tooltip, Card, Divider, Modal, List, Dropdown, Menu } from "antd";
import {
  BellOutlined,
  PushpinOutlined,
  UserAddOutlined,
  SettingOutlined,
  LinkOutlined,
  TeamOutlined,
  HomeOutlined,
  CalendarOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { getUserById } from "../../services/UserService";
import AddMember from "../../pages/Group/AddMember";
import socket from "../../services/Socket";

const InfoGroup = ({ selectedChat }) => {
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [members, setMembers] = useState([]);
  
  const key = 1;
  console.log('====================================');
  console.log(selectedChat);
  console.log('====================================');

  const fetchMembers = async () => {
   try {
          const memberData = await Promise.all(
            selectedChat.list_user_id.map(async (userId) => {
              const response = await getUserById(userId);
              console.log('====================================');
              console.log(response);
              console.log('====================================');
              if (response.status === "success") {
                return response.user;
              } else {
                console.error("Không tìm thấy người dùng với ID này.");
                return null;
              }
            })
          );
          setMembers(memberData.filter((member) => member !== null));
        } catch (error) {
          console.error("Error fetching members:", error);
        }
    };

  useEffect(()=>{
    fetchMembers();
  },[selectedChat.list_user_id])
  const handleOpen = () => {
    setIsMemberModalVisible(true);
  }
  const handleClose = () => {
    setIsMemberModalVisible(false);
  };
  const menu = (friend) => (
    <Menu>
      <Menu.Item key="info" onClick={() => removeMember(friend)}>
        Rời nhóm
      </Menu.Item>
    </Menu>
  );

  const removeMember = (friend) => {    
    socket.emit("remove_member",{
        conversation_id: selectedChat.conversation_id,
        user_id: friend.id,
    });
    handleClose();
  };

  return (
    <>
      <Card
        className="max-w-[450px] max-h-[600px] h-full p-0 rounded-2xl shadow-lg overflow-auto"
        bodyStyle={{ padding: 0 }}
      >
        {/* Header */}
        <div className="flex flex-col items-center py-6 bg-gradient-to-r from-blue-100 to-blue-50 rounded-t-2xl">
          <Avatar.Group
            maxCount={3}
            size={64}
            maxStyle={{ color: "#fff", backgroundColor: "#1890ff" }}
          >
            
              <Avatar src={selectedChat.avatar}>
                
              </Avatar>
           
          </Avatar.Group>
          <h2 className="text-xl font-semibold mt-4 flex items-center gap-2 text-center">
            <TeamOutlined /> {selectedChat.name}
          </h2>
        </div>

        <Divider className="my-4" />

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-4 px-6 mb-6 text-center">
          <Tooltip title="Tắt thông báo">
            <Button
              icon={<BellOutlined />}
              type="ghost"
              className="flex flex-col items-center justify-center"
              size="large"
            >
              <span className="text-xs mt-1">Thông báo</span>
            </Button>
          </Tooltip>
          <Tooltip title="Ghim hội thoại">
            <Button
              icon={<PushpinOutlined />}
              type="ghost"
              className="flex flex-col items-center justify-center"
              size="large"
            >
              <span className="text-xs mt-1">Ghim</span>
            </Button>
          </Tooltip>
          <Tooltip title="Thêm thành viên">
            <Button
              icon={<UserAddOutlined />}
              type="ghost"
              className="flex flex-col items-center justify-center"
              size="large"
              onClick={handleOpen}
            >
              <span className="text-xs mt-1">Thêm</span>
            </Button>
          </Tooltip>
          <Tooltip title="Quản lý nhóm">
            <Button
              icon={<SettingOutlined />}
              type="ghost"
              className="flex flex-col items-center justify-center"
              size="large"
            >
              <span className="text-xs mt-1">Cài đặt</span>
            </Button>
          </Tooltip>
        </div>

        <Divider className="my-4" />

        {/* Group Info */}
        <div className="space-y-6 px-6 text-sm">
          <div
            onClick={handleOpen}
            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <TeamOutlined className="text-blue-500 text-lg" />
            <div>
              <h3 className="font-semibold text-gray-800">Thành viên nhóm</h3>
              <p className="text-gray-600">{members.length || selectedChat.list_user_id.length} thành viên</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <LinkOutlined className="text-green-500 text-lg mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Link tham gia nhóm</h3>
              <a
                href={selectedChat.inviteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
              >
                {selectedChat.inviteLink}
              </a>
            </div>
          </div>
        </div>

        <Divider className="my-4" />

        {/* Extra Features */}
        <div className="px-6 pb-6">
          <Collapse ghost className="text-sm">
            <Collapse.Panel
              header={
                <span className="flex items-center gap-2">
                  <HomeOutlined /> Bảng tin nhóm
                </span>
              }
              key="1"
            >
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Danh sách nhắc hẹn</li>
                <li>Ghi chú, ghim, bình chọn</li>
              </ul>
            </Collapse.Panel>
            <Collapse.Panel
              header={
                <span className="flex items-center gap-2">
                  <CalendarOutlined /> Ảnh / Video
                </span>
              }
              key="2"
            >
              <p className="text-gray-500 italic">
                Chưa có ảnh/video được chia sẻ trong hội thoại này.
              </p>
            </Collapse.Panel>
          </Collapse>
        </div>
      </Card>

      {/* Member Modal */}
      <Modal
        title="Danh sách thành viên"
        visible={isMemberModalVisible}
        onCancel={handleClose}
        footer={null}
        
      >
        <List
          itemLayout="horizontal"
          dataSource={members}
          renderItem={(user) => (
            <List.Item key={user.id} className="hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
              <List.Item.Meta
                avatar={<Avatar src={user.avt} />}
                title={user.fullname}
                description="Thành viên"
              />
              <Dropdown overlay={menu(user)} trigger={['click']}>
  <MoreOutlined className="text-xl cursor-pointer hover:text-gray-600" />
</Dropdown>
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default InfoGroup;
