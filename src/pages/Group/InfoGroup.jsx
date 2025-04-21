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

const InfoGroup = ({ selectedChat, onClose, isGroupSettingsVisible,setIsGroupSettingsVisible,setIsModalAddMemberVisible }) => {
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [members, setMembers] = useState([]);
  const [userOwner, setUserOwner] = useState(null);
  const user = useSelector((state) => state.user.user);
  const [userMain,setUserMain] = useState(null);
  const [disabledModalGroup,setDisabledModalGroup] = useState(false);

  const [isTyped, setIsTyped] = useState(selectedChat?.type === "group" ? true : false);

  const handleOpenAddMember = () => {
    setIsModalAddMemberVisible(true);
  }
  
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

      console.log(selectedChat.list_user_id);
      
  
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
                setGroupSettings((prevSettings) => {
                  const exists = prevSettings.members.some(
                    (member) => member.id === response.user.id
                  );
                
                  if (exists) {
                    return prevSettings; // Không thêm nếu đã tồn tại
                  }
                
                  return {
                    ...prevSettings,
                    members: [
                      ...prevSettings.members,
                      {
                        ...response.user,
                        permission, // thêm field permission vào
                      },
                    ],
                  };
                });
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

  const out_group = async () => {
    const confirmLeave = await Swal.fire({
      title: "Bạn có chắc chắn muốn rời nhóm?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Rời nhóm",
      cancelButtonText: "Hủy",
    });
  
    if (!confirmLeave.isConfirmed) return;
  
    // Nếu là owner, yêu cầu chuyển quyền trước
    if (userMain?.permission === "owner") {
      const transferResult = await Swal.fire({
        title: "Chuyển quyền trưởng nhóm cho ai?",
        input: "select",
        inputOptions: members.reduce((acc, member) => {
          if (member.id !== userMain.id) {
            acc[member.id] = member.fullname;
          }
          return acc;
        }, {}),
        inputPlaceholder: "Chọn người",
        showCancelButton: true,
        inputValidator: (value) => {
          return !value ? "Bạn cần chọn một người!" : null;
        },
        confirmButtonText: "Chuyển quyền",
        cancelButtonText: "Hủy",
      });
  
      if (!transferResult.isConfirmed) return;
  
      const selectedUserId = transferResult.value;
      const selectedUser = members.find((m) => m.id === selectedUserId);
  
      if (selectedUser) {
        // ✅ CHỜ phân quyền hoàn tất
        await grantPermission(selectedUser, "owner");
      } else {
        return Swal.fire("Không tìm thấy người dùng được chọn!", "", "error");
      }
    }
  
    // ✅ Sau khi chuyển quyền, mới thực hiện out_group
    setTimeout(() => {
      socket.emit("out_group", {
        conversation_id: selectedChat.conversation_id,
        user_id: user?.id,
      });
    },1000);
    onClose();
  };
  const removeMember = (friend) => {
    socket.emit("remove_member", {
      conversation_id: selectedChat.conversation_id,
      user_id: friend.id,
    });
    handleClose();
    if(members.length === 2 && friend.permission === "owner"){
      socket.emit("delete_conversation", {
        conversation_id: selectedChat.conversation_id,
      });
      handleClose();
    }
  };

  const grantPermission = (friend, permission) => {
    console.log(permission);
    
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
  
      // Nếu user hiện tại bị phân quyền
      if (user_id === userMain.id) {
        console.log("Cập nhật quyền cho chính user hiện tại");
  
        // Cập nhật danh sách members
        setMembers((prev) =>
          prev.map((member) =>
            member.id === userMain.id ? { ...member, permission: permissions } : member
          )
        );
  
        // Cập nhật quyền trong userMain
        setUserMain((prev) => ({ ...prev, permission: permissions }));

        setIsGroupSettingsVisible(false);
        return;
      }
  
      // Cập nhật quyền cho user trong groupSettings.members
      setGroupSettings((prev) => {
        const updatedMembers = prev.members.map((member) =>
          member.id === user_id ? { ...member, permission: permissions } : member
        );
        return { ...prev, members: updatedMembers };
      });
  
      // Cập nhật quyền trong danh sách members chung
      setMembers((prev) =>
        prev.map((member) =>
          member.id === user_id ? { ...member, permission: permissions } : member
        )
      );
  
      if (permissions === "owner") {
        console.log("-> Owner");
  
        // Thêm vào leaders nếu chưa có
        setGroupSettings((prev) => {
          const isAlreadyLeader = prev.leaders.some((leader) => leader.id === user_id);
          if (!isAlreadyLeader) {
            const memberData = prev.members.find((m) => m.id === user_id);
            if (memberData) {
              const newLeader = { ...memberData, permission: "owner" };
              return {
                ...prev,
                leaders: [...prev.leaders, newLeader],
              };
            }
          }
          return prev;
        });
  
        setDisabledModalGroup(true);
      } else if (permissions === "moderator") {
        console.log("-> Moderator");
  
        setGroupSettings((prev) => {
          const isAlreadyLeader = prev.leaders.some((leader) => leader.id === user_id);
          if (!isAlreadyLeader) {
            const memberData = prev.members.find((m) => m.id === user_id);
            if (memberData) {
              const newLeader = { ...memberData, permission: "moderator" };
              return {
                ...prev,
                leaders: [...prev.leaders, newLeader],
              };
            }
          }
          return prev;
        });
      } else if (permissions === "member") {
        console.log("-> Member");
  
        // Xoá khỏi danh sách leaders nếu có
        setGroupSettings((prev) => ({
          ...prev,
          leaders: prev.leaders.filter((leader) => leader.id !== user_id),
        }));
      } else {
        console.warn("Loại quyền không xác định:", permissions);
      }
    };
  
    socket.on("set_permissions", eventPermission);
  
    return () => {
      socket.off("set_permissions", eventPermission);
    };
  }, [socket, members, userMain?.id]);
  
  
  const menu = (friend) => {
    if (friend.permission === "owner") {
      return (
        <Menu>
          <Menu.Item key="remove" danger onClick={out_group}>
            Rời nhóm
          </Menu.Item>
        </Menu>
      )
    }
  
    return (
      <Menu>
        {friend.permission === "member" && (
          <Menu.Item key="promote" onClick={() => grantPermission(friend, "moderator")}>
            Thêm phó nhóm
          </Menu.Item>
        )}
  
        {friend.permission === "moderator" && (
          <Menu.Item key="demote" onClick={() => grantPermission(friend, "member")}>
            Hủy phó nhóm
          </Menu.Item>
        )}
  
        <Menu.Item key="remove" danger onClick={() => removeMember(friend)}>
          Rời nhóm
        </Menu.Item>
      </Menu>
    );
  };

  return isTyped ? (
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
          onClick={handleOpenAddMember}
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
          onClose={() => setIsGroupSettingsVisible(false)}
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
              {members.length || selectedChat?.list_user_id.length} thành viên
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
      <Tooltip title="Rời nhóm">
          <Button
            type="ghost"
            className="flex flex-col items-center justify-center bg-red-500 my-2 text-white"
            size="large"
            onClick={out_group}
          >
            <span className="text-sm mt-1">Rời nhóm</span>
          </Button>
        </Tooltip>

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
              {userMain?.permission==="owner" && (
                <Dropdown  overlay={menu(user)} trigger={["click"]}>
                <MoreOutlined style={{ transform: 'rotate(90deg)' }} className="text-xl cursor-pointer hover:text-gray-600" />
              </Dropdown>
              )}

            </List.Item>
          )}
        />
      </Modal>
      
    </div>
  ) : (
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
          {selectedChat.name}
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

    
      <div className="mt-3 flex justify-between px-6 mb-6 text-center">
  <Tooltip title="Tắt thông báo">
    <Button
      icon={<BellOutlined />}
      type="ghost"
      className="flex flex-col items-center justify-center py-4"
      size="large"
    >
      <span className="text-xs mt-2">Tắt thông <br></br> báo</span>
    </Button>
  </Tooltip>

  <Tooltip title="Ghim hội thoại">
    <Button
      icon={<PushpinOutlined />}
      type="ghost"
      className="flex flex-col items-center justify-center py-4"
      size="large"
    >
      <span className="text-xs mt-2">Ghim hội <br></br> thoại </span>
    </Button>
  </Tooltip>

  <Tooltip title="Quản lý nhóm">
    <Button
      icon={<SettingOutlined />}
      type="ghost"
      className="flex flex-col items-center justify-center py-4"
      size="large"
      onClick={handleOpenModelSetting}
    >
      <span className="text-xs mt-2">Tạo nhóm <br></br> trò chuyện</span>
    </Button>
  </Tooltip>
</div>


        <Divider className="my-4" />
      <div className="space-y-6 px-6 text-sm flex-1 overflow-y-auto">
        <div
          onClick={handleOpen}
          className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
        >
          <TeamOutlined className="text-blue-500 text-lg" />
          <div>
            <h3 className="font-semibold text-gray-800"> 30 Nhóm chung</h3>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2">
          <CalendarOutlined className="text-green-500 text-lg mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800">Danh sách nhắc hẹn</h3>
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
                <HomeOutlined /> Bảng tin
              </span>
            }
            key="1"
          >
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Danh sách nhắc hẹn</li>
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
      <Tooltip title="Rời nhóm">
          <Button
            type="ghost"
            className="flex flex-col items-center justify-center bg-red-500 my-2 text-white"
            size="large"
          >
            <span className="text-sm mt-1">Xóa lịch sử trò chuyện</span>
          </Button>
        </Tooltip>

      
      
    </div>
  );
};

export default InfoGroup;