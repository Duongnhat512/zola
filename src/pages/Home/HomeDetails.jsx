import React, { useEffect, useRef, useState } from "react";
import ChatSidebar from "../../components/ChatApp/ChatSidebar";
import ChatWindow from "../../components/ChatApp/ChatWindow";
import socket from "../../services/Socket";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import "react-toastify/dist/ReactToastify.css"; // Import CSS cho Toastify
import { toast } from "react-toastify"; // Import react-toastify
import InfoGroup from "../Group/InfoGroup";
import { getUserById } from "../../services/UserService";
import Swal from "sweetalert2";
import { useNotificationTitle, useTotalUnreadCount } from "../../hooks/useNotificationTitle";
const HomeDetails = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const chatRef = useRef(null);
  const [chats, setChats] = useState([]);
  const user = useSelector((state) => state.user.user);
  const [userMain, setUserMain] = useState(null);

  // Sử dụng hook để cập nhật title với số tin nhắn chưa đọc
  const totalUnreadCount = useTotalUnreadCount(chats);
  useNotificationTitle(totalUnreadCount);
  const [isInfoGroupVisible, setIsInfoGroupVisible] = useState(false);
  const [isModalGroupVisible, setIsModalGroupVisible] = useState(false);
  const [IsGroupSettingsVisible, setIsGroupSettingsVisible] = useState(false)
  const [infoPermissions, setInfoPermissions] = useState(null);
  const [isModalAddMemberVisible, setIsModalAddMemberVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [disabledModalGroup, setDisabledModalGroup] = useState(false);
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

  const openChat = (chat) => {
    // localStorage.setItem("selectedChat", JSON.stringify(chat));
    chatRef.current = chat;
    setSelectedChat(chat);
    setIsInfoGroupVisible(false);
    setIsModalGroupVisible(false);
    setIsModalAddMemberVisible(false);
    setIsGroupSettingsVisible(false);

    // Đặt badge về 0 khi mở cuộc trò chuyện
    setChats((prevChats) =>
      prevChats.map((c) =>
        c.conversation_id === chat.conversation_id
          ? { ...c, unread_count: 0 }
          : c
      )
    );
  };
  const fetchConversations = () => {
    if (!socket || !user?.id) return;
    socket.emit("get_conversations", { user_id: user.id });
  };
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleConversations = (response) => {
      if (response.status === "success") {
        const sortedConversations = response.conversations;
        console.log("Sorted conversations:", sortedConversations);

        setChats(sortedConversations);
      } else {
        console.error("Lỗi khi lấy danh sách hội thoại:", response.message);
      }
    };
    socket.on("conversations", handleConversations);
    fetchConversations();

    return () => {
      socket.off("conversations", handleConversations);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handlePinConversationEvent = (data) => {
      if (data.conversation_id === selectedChat.conversation_id) {
        setSelectedChat((prev) => ({
          ...prev,
          pinned: true,
        }));
      }
      // cập nhật lại conversation này lên đầu chats
      setChats((prev) =>
        prev.map((chat) =>
          chat.conversation_id === data.conversation_id
            ? { ...chat, pinned: true }
            : chat
        ).sort((a, b) => b.pinned - a.pinned) // Sắp xếp lại để ghim lên đầu
      );

    }
    // Lắng nghe sự kiện ghim hội thoại từ server
    socket.on("pin_conversation", handlePinConversationEvent);
    // Hủy lắng nghe khi component unmount
    return () => {
      socket.off("pin_conversation", handlePinConversationEvent);
    }
  }, [socket, selectedChat])
  useEffect(() => {
    if (!socket) return;
    const handleUnPinConversationEvent = (data) => {
      if (data.conversation_id === selectedChat.conversation_id) {
        setSelectedChat((prev) => ({
          ...prev,
          pinned: false,
        }));
      }
      // cập nhật lại Chat 
      fetchConversations()
    }
    // Lắng nghe sự kiện ghim hội thoại từ server
    socket.on("unpin_conversation", handleUnPinConversationEvent);
    // Hủy lắng nghe khi component unmount
    return () => {
      socket.off("unpin_conversation", handleUnPinConversationEvent);
    }
  }, [socket, selectedChat])

  const sendMessage = (
    fileData = null,
    notify = false,
    messageNotify = "Đã được phân quyền ",
  ) => {
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
      receiver_id: selectedChat?.list_user_id?.find((user) => user.user_id !== user.id)
        .user_id || null,
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
      console.log(msg);

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
      fetchConversations();
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

    if (profile && data.status === "success") {
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
          console.log('====================================');
          console.log("hello");
          console.log('====================================');
          return { ...member, permission: permissions };
        }
        if (permissions === "owner" && user_id !== user.id) {
          if (member.id === user.id) {
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

  // tạo nhóm
  useEffect(() => {
    if (!socket) return;

    const handleGroupCreated = (data) => {
      setIsModalGroupVisible(false);
      const conversation = data?.conversation;

      if (!conversation) {
        console.error("conversation không tồn tại trong dữ liệu!");
        return;
      }

      const membersWithPermissions = conversation.members.map((member) => ({
        user_id: member,
        permission: member === user.id ? "owner" : "member",
      }));

      setChats((prevChats) => {
        const isDuplicate = prevChats.some(
          (chat) => String(chat.conversation_id) === String(conversation.conversation_id)
        );
        if (isDuplicate) return prevChats;

        return [
          {
            conversation_id: conversation.conversation_id,
            name: conversation.name,
            avatar: conversation.avatar,
            created_by: conversation.created_by,
            list_user_id: membersWithPermissions,
            unread_count: 1,
            is_unread: false,
            type: "group",
          },
          ...prevChats,
        ];
      });
    };

    socket.on("group_created", handleGroupCreated);
    return () => socket.off("group_created", handleGroupCreated);
  }, [socket, user.id]);

  // thêm nhóm mới (client gửi lên)
  useEffect(() => {
    if (!socket) return;

    const handleNewGroup = (data) => {
      const membersWithPermissions = data.members.map((member) => ({
        user_id: member,
        permission: member === data.created_by ? "owner" : "member",
      }));

      setChats((prevChats) => {
        const isDuplicate = prevChats.some(
          (chat) => String(chat.conversation_id) === String(data.conversation_id)
        );
        if (isDuplicate) return prevChats;

        return [
          {
            conversation_id: data.conversation_id,
            name: data.group_name,
            avatar: data.group_avatar,
            created_by: data.created_by,
            list_user_id: membersWithPermissions,
            unread_count: 1,
            is_unread: false,
            type: "group",
          },
          ...prevChats,
        ];
      });
    };

    socket.on("new_group", handleNewGroup);
    return () => socket.off("new_group", handleNewGroup);
  }, [socket, selectedChat]);

  // Thành viên bị xóa khỏi nhóm
  useEffect(() => {
    if (!socket) return;

    const handleRemovedMember = async (data) => {
      const userToAdd = data.user_id;
      const profile = await getProfile(userToAdd);
      if (profile && data.status === "success") {
        sendMessage(null, true, `${userProfile?.fullname} đã bị xóa khỏi nhóm`);
      }

      if (data.user_id === user.id) {
        setChats(prev => prev.filter(chat => chat.conversation_id !== data.conversation_id));
        setSelectedChat(null);
        setIsInfoGroupVisible(false);
        return;
      }

      if (!selectedChat || selectedChat.conversation_id !== data.conversation_id) {
        fetchConversations();
        return;
      }

      setChats(prev =>
        prev.map(chat => {
          if (chat.conversation_id === data.conversation_id) {
            return {
              ...chat,
              list_user_id: chat.list_user_id.filter(member => member.user_id !== data.user_id),
              unread_count: 1,
            };
          }
          return chat;
        })
      );

      setSelectedChat(prev => ({
        ...prev,
        list_user_id: prev.list_user_id?.filter(member => member.user_id !== data.user_id),
      }));
    };

    socket.on("removed_member", handleRemovedMember);
    return () => socket.off("removed_member", handleRemovedMember);
  }, [socket, selectedChat, user.id, userProfile]);

  //Thành viên rời nhóm
  useEffect(() => {
    if (!socket) return;

    const handleOutGroupMember = (data) => {
      if (!selectedChat || selectedChat.conversation_id !== data.conversation_id) {
        fetchConversations();
        return;
      }

      setChats(prev =>
        prev.map(chat => {
          if (chat.conversation_id === data.conversation_id) {
            return {
              ...chat,
              list_user_id: chat.list_user_id.filter(member => member.user_id !== data.user_id),
              unread_count: 1,
            };
          }
          return chat;
        })
      );

      setSelectedChat(prev => ({
        ...prev,
        list_user_id: prev.list_user_id?.filter(member => member.user_id !== data.user_id),
      }));
    };

    socket.on("user_left_group", handleOutGroupMember);
    return () => socket.off("user_left_group", handleOutGroupMember);
  }, [socket, selectedChat]);

  // Thêm thành viên
  useEffect(() => {
    if (!socket) return;

    const handleAddMember = async (data) => {
      const profile = await getProfile(data.user_id);
      if (profile && data.status === "success") {
        sendMessage(null, true, `${profile.fullname} đã được thêm vào nhóm`);
      }

      if (!selectedChat || selectedChat.conversation_id !== data.conversation_id) {
        fetchConversations();
        return;
      }

      setSelectedChat(prev => {
        const isAlreadyMember = prev.list_user_id.some(
          (member) => member.user_id === data.user_id
        );
        if (isAlreadyMember) return prev;

        return {
          ...prev,
          list_user_id: [
            ...prev.list_user_id,
            {
              user_id: data.user_id,
              permission: data.permission || "member",
            },
          ],
        };
      });
    };
    socket.on("add_member", handleAddMember);
    return () => socket.off("add_member", handleAddMember);
  }, [socket, selectedChat]);

  //Nhóm bị xóa hoặc bị rời khỏi nhóm
  useEffect(() => {
    if (!socket) return;

    const handleGroupRemoved = (data) => {
      if (!selectedChat || selectedChat.conversation_id !== data.conversation_id) {
        fetchConversations();
        return;
      }
      setChats(prev => prev.filter(
        (chat) => String(chat.conversation_id) !== String(data.conversation_id)
      ));
      setSelectedChat(null);
      setIsInfoGroupVisible(false);
      setIsGroupSettingsVisible(false);
      if (data.success) {
        Swal.fire('Đã xóa!', 'Nhóm đã được xóa thành công.', 'success');
      }
    };

    socket.on("group_deleted", handleGroupRemoved);
    socket.on("delete_group", handleGroupRemoved);
    return () => {
      socket.off("group_deleted", handleGroupRemoved);
      socket.off("delete_group", handleGroupRemoved);
    };
  }, [socket, selectedChat]);

  //Cập nhật quyền
  useEffect(() => {
    if (!socket) return;

    const handleUpdatePermissions = async (data) => {
      if (!selectedChat || selectedChat.conversation_id !== data.conversation_id) {
        fetchConversations();
        return;
      }

      await processPermissionUpdate(data);
      setIsGroupSettingsVisible(false);
      setInfoPermissions((prev) => ({
        ...prev,
        message: data.message,
      }));
    };

    socket.on("update_permissions", handleUpdatePermissions);
    return () => socket.off("update_permissions", handleUpdatePermissions);
  }, [socket, selectedChat]);

  // Xử lý khi user tự rời nhóm
  useEffect(() => {
    if (!socket) return;

    const handleOutGroup = async (data) => {
      console.log('====================================');
      console.log(data);
      console.log('====================================');
      if (!selectedChat || selectedChat.conversation_id !== data.conversation_id) {

        fetchConversations();
        return;
      }

      const profile = await getProfile(data.user_id);
      if (profile && data.status === "success") {
        sendMessage(null, true, `${profile.fullname} đã rời nhóm`);
      }

      setChats((prev) =>
        prev.filter((chat) => String(chat.conversation_id) !== String(data.conversation_id))
      );
      setIsInfoGroupVisible(false);
      setSelectedChat(null);
    };

    socket.on("out_group", handleOutGroup);
    return () => socket.off("out_group", handleOutGroup);
  }, [socket, selectedChat]);

  // Xóa thành viên khỏi nhóm
  useEffect(() => {
    if (!socket) return;

    const handleRemoveMember = async (data) => {
      const profile = await getProfile(data.user_id);
      if (profile && data.status === "success") {
        sendMessage(null, true, `${profile.fullname} đã bị xóa khỏi nhóm`);
      }

      setSelectedChat((prev) => ({
        ...prev,
        list_user_id: prev.list_user_id.filter(
          (member) => member.user_id !== data.user_id
        ),
      }));
    };

    socket.on("remove_member", handleRemoveMember);
    return () => socket.off("remove_member", handleRemoveMember);
  }, [socket, selectedChat]);
  useEffect(() => {
    const handleUploadGroupAvt = async (data) => {
      const avatar = data.result.avatar;
      if (avatar && data.status === "success") {
        sendMessage(null, true, `Ảnh đại diện nhóm đã thay đổi`);
      }
      setChats(prev =>
        prev.map(chat => {
          if (chat.conversation_id === data.conversation_id) {
            return {
              ...chat,
              avatar: avatar
            };
          }
          return chat;
        })
      );
      setSelectedChat((prev) => {
        return {
          ...prev,
          avatar
        };
      });
    };

    socket.on("update_avt_group", handleUploadGroupAvt);

    return () => {
      socket.off("update_avt_group", handleUploadGroupAvt);
    };
  }, [socket, selectedChat]);
  useEffect(() => {
    const handleUpdateNameGroup = async (data) => {
      if (data.status === "success") {
        sendMessage(null, true, data.message);
      }
      setChats(prev =>
        prev.map(chat => {
          if (chat.conversation_id === data.conversation_id) {
            return {
              ...chat,
              name: data.result.name
            };
          }
          return chat;
        })
      );
      setSelectedChat((prev) => {
        return {
          ...prev,
          name: data.result.name
        };
      });
    };
    socket.on("update_name_group", handleUpdateNameGroup);

    return () => {
      socket.off("update_name_group", handleUpdateNameGroup);
    };
  }, [socket, selectedChat]);


  useEffect(() => {
    const handleForwardMessage = async (data) => {
      if (data.status === "success") {
        toast.success("Tin nhắn đã được chuyển tiếp!");

      } else {
        toast.error("Chuyển tiếp tin nhắn thất bại!");
      }
    };

    socket.on("message_forwarded", handleForwardMessage);

    return () => {
      socket.off("message_forwarded", handleForwardMessage);
    };
  }, [socket, selectedChat]);
  useEffect(() => {
    const handlePinMessage = (data) => {
      if (data.status === "success") {
        sendMessage(null, true, `Tin nhắn ${data.message_text} đã được ghim!`);
      } else {
        toast.error("Không thể ghim tin nhắn.");
      }
    };

    socket.on("pin_message_success", handlePinMessage);
    return () => {
      socket.off("pin_message_success", handlePinMessage);
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    const handleError = async (data) => {
      toast.error(data.message)
    }
    socket.on("error", handleError);

    return () => {
      socket.off("error", handleError);
    };
  }, [socket])


  useEffect(() => {
    const handlePinMessageClient = async (data) => {
      if (data.status === "success") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.message_id
              ? {
                ...msg,
                pinned: true,
              }
              : msg
          )
        );
      } else {
        toast.error("Ghim tin nhắn thất bại!");
      }
    }
    socket.on("message_pinned", handlePinMessageClient);

    return () => {
      socket.off("message_pinned", handlePinMessageClient);
    };
  }, [socket, selectedChat])

  useEffect(() => {
    const handleUnPinMessage = async (data) => {
      if (data.status === "success") {
        sendMessage(null, true, `Tin nhắn ` + data.message_text + " đã được bỏ ghim!");
      }
    }
    socket.on("unpin_message_success", handleUnPinMessage);

    return () => {
      socket.off("unpin_message_success", handleUnPinMessage);
    };

  }, [socket, selectedChat])

  useEffect(() => {
    const handleUnPinMessageClient = async (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.message_id
            ? {
              ...msg,
              pinned: false,
            }
            : msg
        )
      );
    }

    socket.on("message_unpinned", handleUnPinMessageClient);

    return () => {
      socket.off("message_unpinned", handleUnPinMessageClient);
    };

  }, [socket, selectedChat])


  return (
    <div className="flex h-screen w-full bg-gray-100">
      <ChatSidebar
        chats={chats}
        openChat={openChat}
        setIsModalGroupVisible={setIsModalGroupVisible}

        isModalGroupVisible={isModalGroupVisible}
        setChats={setChats}
        selectedChat={selectedChat} // Thêm prop này
        setMessages={setMessages}   // Thêm prop này
        setSelectedChat={setSelectedChat} // Thêm prop này
      />
      <ChatWindow
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        setChats={setChats}
        chats={chats}
        fetchConversations={fetchConversations}
        setIsInfoGroupVisible={setIsInfoGroupVisible}
        isInfoGroupVisible={isInfoGroupVisible}
        isModalGroupVisible={isModalGroupVisible}
        infoPermissions={infoPermissions}
        isModalAddMemberVisible={isModalAddMemberVisible}
        setIsModalAddMemberVisible={setIsModalAddMemberVisible}
        messages={messages}
        setMessages={setMessages}
      />
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

export default HomeDetails;
