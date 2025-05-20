import React, { useState, useEffect } from "react";
import { Input, Avatar, List, Divider, Select, Button, Menu, Dropdown, message, Modal } from "antd";
import { MoreOutlined, UserOutlined } from "@ant-design/icons";
import { deleteFriend, getListFriend } from "../../services/FriendService";
import { useDispatch, useSelector } from "react-redux";
import { getGroupById, getGroupConversation, getPrivateConversation } from "../../services/Conversation";
import ChatWindow from "../../components/ChatApp/ChatWindow";
import InfoFriend from "../../components/ChatApp/InfoFriend";
import Swal from "sweetalert2";
import InfoGroup from "./InfoGroup";
import socket from "../../services/Socket";
import { getUserById } from "../../services/UserService";
import { toast } from "react-toastify";

const GroupList = () => {
  const [groups, setGroup] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("A-Z");
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const user = useSelector((state) => state.user.user);
  const [userInfo, setUserInfo] = useState(null);
  const [openModalFriend, setOpenModalFriend] = useState(false);
  const [step, setStep] = useState("info");
  const [chats, setChats] = useState([]);
  const [isInfoGroupVisible, setIsInfoGroupVisible] = useState(false);
  const [isModalGroupVisible, setIsModalGroupVisible] = useState(false);
  const [IsGroupSettingsVisible, setIsGroupSettingsVisible] = useState(false)
  const [infoPermissions, setInfoPermissions] = useState(null);
  const [isModalAddMemberVisible, setIsModalAddMemberVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userMain, setUserMain] = useState(null);
  const [disabledModalGroup, setDisabledModalGroup] = useState(false);
  const [members, setMembers] = useState([]);

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
  const handleBack = () => {
    setOpenModalFriend(false);
  }
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await getGroupConversation(user.id);
        console.log(response);

        if (response.status === 'success' && Array.isArray(response.conversations)) {
          setGroup(response.conversations);
        }
      } catch (error) {
        console.error("Error fetching friend list:", error);
      }
    };

    fetchGroups();
  }, [user.id]);
  const grantPermission = (friend, permission, group) => {
    // Gửi phân quyền cho người được chọn
    socket.emit("set_permissions", {
      conversation_id: group.id,
      user_id: friend.id,
      permissions: permission
    });
  };
  const handleOutGroup = async (group) => {
    const confirmLeave = await Swal.fire({
      title: "Bạn có chắc chắn muốn rời nhóm?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Rời nhóm",
      cancelButtonText: "Hủy",
    });
    let members = group?.list_user_id || [];
    members = await Promise.all(
      members.map(async (member) => {
        const res = await getUserById(member.user_id);
        return res.status === "success" ? { ...member, ...res.user } : member;
      })
    );
    let permission = group.list_user_id.find((member) => member.user_id === user.id).permission;
    if (!confirmLeave.isConfirmed) return;

    // Nếu là owner, yêu cầu chuyển quyền trước
    if (permission === "owner") {
      const transferResult = await Swal.fire({
        title: "Chuyển quyền trưởng nhóm cho ai?",
        input: "select",
        inputOptions: members.reduce((acc, member) => {
          if (member.id !== user.id) {
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

      console.log('====================================');
      console.log(selectedUser);
      console.log('====================================');

      if (selectedUser) {
        // ✅ CHỜ phân quyền hoàn tất
        await grantPermission(selectedUser, "owner", group);
      } else {
        return Swal.fire("Không tìm thấy người dùng được chọn!", "", "error");
      }
    }

    setTimeout(() => {
      socket.emit("out_group", {
        conversation_id: group.id,
        user_id: user?.id,
      });
    }, 1000);
  };

  useEffect(() => {
    if (!socket) return;

    const handleOutGroup = async (data) => {
      toast.success(data.message);
      setGroup((prevGroups) =>
        prevGroups.filter((group) => group.id !== data.conversation_id)
      );
    };

    socket.on("out_group", handleOutGroup);

    return () => {
      socket.off("out_group", handleOutGroup);
    };
  }, [socket]);


  const handleFindConversation = async (conversation) => {
    try {
      setSelectedChat(conversation);
      const response = await getGroupById(conversation.id);
      setSelectedChat(response.conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };
  const sendMessage = (
    fileData = null,
    notify = false,
    messageNotify = "Đã được phân quyền ",
  ) => {

    let selectedChat = localStorage.getItem("selectedChat");

    if (selectedChat) {
      try {
        selectedChat = JSON.parse(selectedChat);
      } catch (error) {
        console.error("Lỗi khi parse selectedChat từ localStorage:", error);
        selectedChat = null;
      }
    } else {
      selectedChat = null;
    }
    if (
      !notify &&
      !input.trim() &&
      !previewImage &&
      !selectedFile &&
      !selectedImage &&
      !selectedVideo &&
      !fileData
    ) {
      toast.error("Vui lòng nhập nội dung tin nhắn hoặc chọn tệp để gửi.");
      return;
    }
    const tempId = `msg-${Date.now()}`;
    const isGroup = selectedChat?.type === "group";
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender: notify ? "system" : "me", // Nếu là notify, sender là "system"
        avatar: notify ? null : user.avatar || "/default-avatar.jpg",
        text: notify ? messageNotify : input || null,
        media: notify ? null : previewImage || null,
        file_name: notify
          ? null
          : selectedFile?.file_name || fileData?.file_name || null,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: notify ? "notify" : "text", // Gán type là "notify" nếu là thông báo
        status: notify ? "sent" : "pending", // Notify không cần trạng thái pending
        uploadProgress: notify ? null : 0, // Notify không cần uploadProgress
      },
    ]);


    const msg = {
      conversation_id: selectedChat?.conversation_id || null,
      receiver_id: !isGroup
        ? selectedChat?.list_user_id?.find(u => u.user_id !== user.id)?.user_id
        : null,
      message: notify ? messageNotify : input || null,
      file_name:
        selectedVideo?.file_name ||
        selectedImage?.file_name ||
        selectedFile?.file_name ||
        fileData?.file_name ||
        null,
      file_type:
        selectedVideo?.file_name ||
        selectedImage?.file_type ||
        selectedFile?.file_type ||
        fileData?.file_type ||
        null,
      file_size:
        selectedVideo?.file_name ||
        selectedImage?.file_size ||
        selectedFile?.file_size ||
        fileData?.file_size ||
        null,
      file_data:
        selectedVideo?.file_name ||
        selectedImage?.file_data ||
        selectedFile?.file_data ||
        fileData?.file_data ||
        null,
      is_notify: notify,
    };
    const event = isGroup ? "send_group_message" : "send_private_message";
    socket.emit(event, msg, () => { });
    socket.on("message_sent", (msg) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
              ...m,
              id: msg.message_id,
              text: msg.message || null,
              media: msg.media || null,
              file_name: msg.file_name || null,
              type: notify ? "notify" : msg.type || "text",
              time: new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              status: "sent",
            }
            : m
        )
      );
    });

    setInput("");
    setPreviewImage(null);
    setSelectedFile(null);
    setSelectedImage(null);
    setSelectedVideo(null);
    // if (!notify) simulateUpload(tempId);
  };
  const getProfile = async (userId) => {
    try {
      const response = await getUserById(userId);
      if (response.status === "success") {
        setUserProfile(response.user);
        return response.user; // 🔁 trả về user để dùng sau
      } else {
        console.error("Failed to fetch user profile:", response.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }
  const processPermissionUpdate = async (data, isSocketEvent = false) => {
    const { permissions, user_id, conversation_id } = data;

    const permissionName =
      permissions === "owner"
        ? "Trưởng nhóm"
        : permissions === "moderator"
          ? "Phó nhóm"
          : "Thành viên";

    const profile = await getProfile(user_id);

    if (profile) {
      const displayName = profile.fullname || "Người dùng";
      sendMessage(null, true, `${displayName} đã trở thành ${permissionName}`);
    }
    // Cập nhật quyền trong danh sách chat hiện tại
    if (!isSocketEvent && selectedChat?.conversation_id === conversation_id) {
      setSelectedChat((prev) => {
        const updatedList = prev.list_user_id?.map((member) =>
          member.user_id === user_id ? { ...member, permission: permissions } : member
        );
        return { ...prev, list_user_id: updatedList };
      });
    }
    setMembers((prev) =>
      prev.map((member) => {
        if (member.id === user_id) {
          return { ...member, permission: permissions };
        }
        if (permissions === "owner" && user_id !== userMain.id) {
          if (member.id === userMain.id) {
            return { ...member, permission: "member" };
          }
        }
        // Nếu không phải thành viên được cập nhật, giữ nguyên quyền
        return member;
      })
    );

    // Cập nhật trong groupSettings và members
    setGroupSettings((prev) => {
      const updatedMembers = prev.members.map((member) =>
        member.id === user_id ? { ...member, permission: permissions } : member
      );

      let updatedLeaders = prev.leaders;
      if (permissions === "owner" || permissions === "moderator") {
        const isAlreadyLeader = prev.leaders.some((leader) => leader.id === user_id);
        if (!isAlreadyLeader) {
          const memberData = updatedMembers.find((m) => m.id === user_id);
          if (memberData) {
            const newLeader = { ...memberData, permissions };
            updatedLeaders = [...prev.leaders, newLeader];
          }
        }
      } else if (permissions === "member") {
        updatedLeaders = prev.leaders.filter((leader) => leader.id !== user_id);
      }

      return {
        ...prev,
        members: updatedMembers,
        leaders: updatedLeaders,
      };
    });
    if (permissions === "owner") {
      setDisabledModalGroup(true);
      setIsGroupSettingsVisible(false);
    }
  };
  const filteredGroup = groups
    .filter((group) =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "A-Z") {
        return a.name?.localeCompare(b.name || "");
      } else {
        return b.name?.localeCompare(a.name || "");
      }
    });

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      {selectedChat === null ? (
        <div className="flex-1 bg-white p-6">
          <h1 className="text-xl font-semibold mb-4">Danh sách nhóm và cộng đồng</h1>
          <div className="flex justify-between items-center mb-4">
            <span>Nhóm và cộng đồng ({groups.length})</span>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm kiếm nhóm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-md"
              />
              <Select
                value={sortOrder}
                onChange={(value) => setSortOrder(value)}
                className="rounded-md"
              >
                <Select.Option value="A-Z">Tên (A-Z)</Select.Option>
                <Select.Option value="Z-A">Tên (Z-A)</Select.Option>
              </Select>
            </div>
          </div>

          <div>
            <List
              dataSource={filteredGroup}
              renderItem={(group) => {
                const menu = (
                  <Menu>
                    {/* <Menu.Item key="info" onClick={() => handleViewInfo(friend)}>
                        Xem thông tin
                      </Menu.Item> */}
                    <Menu.Item key="remove" onClick={() => handleOutGroup(group)}>
                      Rời nhóm
                    </Menu.Item>
                  </Menu>
                );

                return (
                  <List.Item className="flex items-center gap-4 justify-between">
                    <div onClick={() => handleFindConversation(group)}
                      className="flex flex-1 items-center gap-2 hover:bg-gray-100 p-2 rounded cursor-pointer"
                    >
                      <Avatar size={40} icon={<UserOutlined />} src={group.avatar || '/default.png'} />
                      <div>
                        <span>{group.name}</span>
                        <p className="text-sm text-gray-500">
                          {group.no_of_member} thành viên
                        </p>
                      </div>

                    </div>

                    <Dropdown overlay={menu} trigger={['click']}>
                      <MoreOutlined className="text-xl cursor-pointer hover:text-gray-600" />
                    </Dropdown>
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      ) : (
        <ChatWindow
          selectedChat={selectedChat}
          messages={messages}
          input={input}
          setMessages={setMessages}
          setInput={setInput}
          setChats={setChats}
          setIsInfoGroupVisible={setIsInfoGroupVisible}
          isInfoGroupVisible={isInfoGroupVisible}
          isModalGroupVisible={isModalGroupVisible}
          infoPermissions={infoPermissions}
          isModalAddMemberVisible={isModalAddMemberVisible}
          setIsModalAddMemberVisible={setIsModalAddMemberVisible}
        />
      )}
      {isInfoGroupVisible && (
        <InfoGroup
          selectedChat={selectedChat}
          onClose={() => setIsInfoGroupVisible(false)}
          isGroupSettingsVisible={IsGroupSettingsVisible}
          setIsGroupSettingsVisible={setIsGroupSettingsVisible}
          setIsModalAddMemberVisible={setIsModalAddMemberVisible}
          sendMessage={sendMessage}
          getProfile={getProfile}
          userProfile={userProfile}
          userMain={userMain}
          setUserMain={setUserMain}
          disabledModalGroup={disabledModalGroup}
          setDisabledModalGroup={setDisabledModalGroup}
          members={members}
          setMembers={setMembers}
          groupSettings={groupSettings}
          setGroupSettings={setGroupSettings}
          processPermissionUpdate={processPermissionUpdate}
        />
      )}
    </div>
  );
};

export default GroupList;
