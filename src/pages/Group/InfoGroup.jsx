import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Collapse,
  Tooltip,
  Card,
  Divider,
  Modal,
  List,
  Dropdown,
  Menu,
  Alert,
} from "antd";
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
import socket from "../../services/Socket";
import GroupSettingsModal from "../../components/ChatApp/GroupSettingsModal";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const InfoGroup = ({ selectedChat, onClose }) => {
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [members, setMembers] = useState([]);
  const [isGroupSettingsVisible, setIsGroupSettingsVisible] = useState(false);
  const [userOwner, setUserOwner] = useState(null);
  const user = useSelector((state) => state.user.user);
  const [userMain,setUserMain] = useState(null);
  const [disabledModalGroup,setDisabledModalGroup] = useState(false);

  const [groupSettings, setGroupSettings] = useState({
    leaders: [],
    members: [],
    changeGroupInfo: true,
    pinMessages: false,
    createReminders: true,
    createPolls: true,
    sendMessages: true,
    approveNewMembers: false,
    markLeaderMessages: false,
    allowNewMembersRead: true,
    allowJoinLink: true,
  });

  const handleOpenModelSetting = () => {
     if(userMain?.permission === "member"){
        Swal.fire({
          icon: "error",
          title: "Bạn không có quyền truy cập",
          text: "Chỉ trưởng nhóm hoặc phó nhóm mới có thể thay đổi cài đặt nhóm.",
        });
     }
     else{
      setIsGroupSettingsVisible(true);
     }
  }
  const handleCloseModelSetting = () => {
    setIsGroupSettingsVisible(false);
 }

  const fetchMembers = async () => {
    try {
      if (!Array.isArray(selectedChat?.list_user_id)) {
        console.error("list_user_id không phải mảng:", selectedChat?.list_user_id);
        return;
      }
      console.log("Fetch member");
      
  
      // Reset leaders và userOwner trước khi fetch lại
      setUserOwner(null);  // Reset userOwner (leader)
      setGroupSettings((prevSettings) => ({
        ...prevSettings,
        leaders: [],  // Reset danh sách leaders
        members: [],
      }));
  
      const memberData = await Promise.all(
        selectedChat.list_user_id.map(async ({ user_id, permission }) => {
          try {
            const response = await getUserById(user_id);
            if (response.status === "success") {
              if(user?.id === response.user.id){
                setUserMain({ ...response.user,
                  permission})
              } 
              if (permission === "owner" || permission === "moderator") {
                // Cập nhật leader nếu là owner hoặc moderator
                if(permission === "owner"){
                  setUserOwner(response.user);
                }
                setGroupSettings((prevSettings) => ({
                  ...prevSettings,
                  leaders: [
                    ...prevSettings.leaders,
                    {
                      ...response.user,
                      permission,  // thêm field permission vào đây
                    },
                  ],
                })); 
              }
              if(permission !== "owner"){
                setGroupSettings((prevSettings) => ({
                  ...prevSettings,
                  members: [
                    ...prevSettings.members,
                    {
                      ...response.user,
                      permission,  // thêm field permission vào đây
                    },
                  ],
                })); 
              }
              return {
                ...response.user,
                permission, // Gán quyền cho user
              };
            } else {
              console.warn("Không tìm thấy người dùng với ID:", user_id);
              return null;
            }
          } catch (err) {
            console.error("Lỗi khi lấy thông tin người dùng:", err);
            return null;
          }
        })
      );
  
      // Cập nhật thành viên
      setMembers(memberData.filter(Boolean)); // Loại bỏ null nếu có
    } catch (error) {
      console.error("Lỗi khi fetch thành viên:", error);
    }
  };
  
  useEffect(() => {
    fetchMembers();
  }, [selectedChat?.list_user_id, selectedChat]);

  const handleOpen = () => {
  
    setIsMemberModalVisible(true);
    
  };
  const handleClose = () => {
    setIsMemberModalVisible(false);
  };

  const handleUpdateSettings = (updatedSettings) => {
    setGroupSettings(updatedSettings);
    console.log("Updated group settings:", updatedSettings);
  };

  
  const removeMember = (friend) => {
    socket.emit("remove_member", {
      conversation_id: selectedChat.conversation_id,
      user_id: friend.id,
    });
    handleClose();
  };

  const grantPermission = (friend,permission) => {
    socket.emit("set_permissions", {
      conversation_id: selectedChat.conversation_id,
      user_id: friend.id,
      permissions: permission
    });
    if(permission === "owner"){
      console.log("phân quyền owner nè");
      
      socket.emit("set_permissions",{
        conversation_id: selectedChat.conversation_id,
        user_id: userMain.id,
        permissions: "member"
      })
    }  
  }
  useEffect(() => {
    const eventPermission = (data) => {
      const { permissions, user_id } = data;
      console.log("Phân quyền:", permissions);
  
      

      setGroupSettings((prev) => {
        const updatedMembers = prev.members.map((member) =>
          member.id === user_id ? { ...member, permission: permissions } : member
        );
        return {
          ...prev,
          members: updatedMembers,
        };
        });
      switch (permissions) {
        case "owner": 
        setMembers((prev) =>
          prev.map((member) =>
            member.id === user_id ? { ...member, permission: permissions } : member
          )
        );
        // Xoá khỏi danh sách leader nếu tồn tại
        setGroupSettings((prev) => {
          const isAlreadyLeader = prev.leaders.some((l) => l.id === user_id);
          if (!isAlreadyLeader) {
            const memberData = members.find((m) => m.id === user_id);
            if (memberData) {
              const newLeader = {
                ...memberData,
                permission: "owner", // Thêm permission tại đây
              };
              return {
                ...prev,
                leaders: [...prev.leaders, newLeader],
              };
            }
          }
          return prev;
        });  
        setDisabledModalGroup(true);
        break;

        case "member":
          console.log("-> Member");

          // Cập nhật quyền trong danh sách members
          setMembers((prev) =>
            prev.map((member) =>
              member.id === user_id ? { ...member, permission: permissions } : member
            )
          );
  
          // Xoá khỏi danh sách leader nếu tồn tại
          setGroupSettings((prev) => ({
            ...prev,
            leaders: prev.leaders.filter((leader) => leader.id !== user_id),
          }));
          break;
        case "moderator":
          console.log("-> Moderator");
  
          // Cập nhật quyền trong danh sách members
          setMembers((prev) =>
            prev.map((member) =>
              member.id === user_id ? { ...member, permission: permissions } : member
            )
          );
  
          // Thêm vào danh sách leaders nếu chưa có
          setGroupSettings((prev) => {
            const isAlreadyLeader = prev.leaders.some((l) => l.id === user_id);
            if (!isAlreadyLeader) {
              const memberData = members.find((m) => m.id === user_id);
              if (memberData) {
                const newLeader = {
                  ...memberData,
                  permission: "moderator", // Thêm permission tại đây
                };
                return {
                  ...prev,
                  leaders: [...prev.leaders, newLeader],
                };
              }
            }
            return prev;
          });  
          break;
  
        default:
          console.warn("Unknown permission type:", permissions);
      }
    };
  
    socket.on("set_permissions", eventPermission);
  
    return () => {
      socket.off("set_permissions", eventPermission);
    };
  }, [socket, members]);
  
  const menu = (friend) => (
    <Menu>
      <Menu.Item key="info" onClick={() => removeMember(friend)}>
        Rời nhóm
      </Menu.Item>
      <Menu.Item key="permission" onClick={() => grantPermission(friend,"moderator")}>
        Thêm phó nhóm
      </Menu.Item>
    </Menu>
  );
  return (
    <div
    className="w-1/4 border-r border-gray-300 flex flex-col bg-white shadow-lg "
    style={{ zIndex: 1000 }}
    >
      {/* Header */}
      <div className="flex flex-col items-center py-6 bg-gradient-to-r from-blue-100 to-blue-50">
        <Avatar.Group
          maxCount={3}
          size={64}
          maxStyle={{ color: "#fff", backgroundColor: "#1890ff" }}
        >
          <Avatar src={selectedChat.avatar}></Avatar>
        </Avatar.Group>
        <h2 className="text-xl font-semibold mt-4 flex items-center gap-2 text-center">
          <TeamOutlined /> {selectedChat.name}
        </h2>
        <Button
          type="text"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          Đóng
        </Button>
      </div>

      <Divider className="my-4" />

    
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
          onClick={handleOpenModelSetting}
            >
          <span className="text-xs mt-1">Cài đặt</span>
            </Button>
          </Tooltip>
        </div>

        <Divider className="my-4" />

        {/* Group Settings Modal */}
        <GroupSettingsModal
          disable={disabledModalGroup}
          visible={isGroupSettingsVisible}
          onClose={handleCloseModelSetting}
          groupSettings={groupSettings}
          onUpdateSettings={handleUpdateSettings}
          seletedChat={selectedChat}
          userMain={userMain}
          userOwner={userOwner}
          grantPermission={grantPermission}
        />

        {/* Group Info */}
      <div className="space-y-6 px-6 text-sm flex-1 overflow-y-auto">
        <div
          onClick={handleOpen}
          className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
        >
          <TeamOutlined className="text-blue-500 text-lg" />
          <div>
            <h3 className="font-semibold text-gray-800">Thành viên nhóm</h3>
            <p className="text-gray-600">
              {members.length || selectedChat.list_user_id.length} thành viên
            </p>
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
            <List.Item
              key={user.id}
              className="items-center hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
            >
              <List.Item.Meta
                avatar={<Avatar src={user.avt} />}
                title={user.fullname}
                description={
                  user.permission === "owner"
                    ? "Trưởng nhóm"
                    : user.permission === "moderator"
                    ? "Phó nhóm"
                    : "Thành viên"
                }
              />
              {userOwner?.id === userMain.id && (
                <Dropdown  overlay={menu(user)} trigger={["click"]}>
                <MoreOutlined style={{ transform: 'rotate(90deg)' }} className="text-xl cursor-pointer hover:text-gray-600" />
              </Dropdown>
              )}

            </List.Item>
          )}
        />
      </Modal>
      
    </div>
  );
};

export default InfoGroup;