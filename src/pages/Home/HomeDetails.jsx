import React, { useEffect, useState } from "react";
import ChatSidebar from "../../components/ChatApp/ChatSidebar";
import ChatWindow from "../../components/ChatApp/ChatWindow";
import socket from "../../services/Socket";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import "react-toastify/dist/ReactToastify.css"; // Import CSS cho Toastify
import { toast } from "react-toastify"; // Import react-toastify
import InfoGroup from "../Group/InfoGroup";
import { getUserById } from "../../services/UserService";
const HomeDetails = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const user = useSelector((state) => state.user.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoGroupVisible, setIsInfoGroupVisible] = useState(false);
  const [isModalGroupVisible, setIsModalGroupVisible] = useState(false);
  const [ IsGroupSettingsVisible,setIsGroupSettingsVisible] = useState(false)
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

  const openChat = (chat) => {
    setIsInfoGroupVisible(false);
    setIsModalGroupVisible(false);
    setIsModalAddMemberVisible(false);
    setIsGroupSettingsVisible(false);
    setSelectedChat(chat);
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
        console.log("response.conversations", response.conversations);
        setChats(response.conversations);
      } else {
        console.error("Lỗi khi lấy danh sách hội thoại:", response.message);
      }
    };
    socket.on("conversations", handleConversations);
    fetchConversations();
  
    return () => {
      socket.off("conversations", handleConversations);
    };
  }, [user?.id]);

  const sendMessage = (
    fileData = null,
    notify = false,
    messageNotify = "Đã được phân quyền "
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
    console.log(selectedChat?.list_user_id);
    

    const msg = {
      conversation_id: selectedChat?.conversation_id || null,
      receiver_id:
        selectedChat?.list_user_id?.find((userMain) => userMain.user_id !== user.id)
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

    console.log(msg);
    

    const event = isGroup ? "send_group_message" : "send_private_message";
    socket.emit(event, msg, () => {});
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
  
    // Cập nhật quyền nếu là chính mình
    if (user_id === userMain.id) {
      setMembers((prev) =>
        prev.map((member) =>
          member.id === user_id ? { ...member, permission: permissions } : member
        )
      );
      setUserMain((prev) => ({ ...prev, permission: permissions }));
      setIsGroupSettingsVisible(false);
      return;
    }
  
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
  
    setMembers((prev) =>
      prev.map((member) =>
        member.id === user_id ? { ...member, permission: permissions } : member
      )
    );
  
    if (permissions === "owner") {
      setDisabledModalGroup(true);
    }
  };
  
  
  useEffect(() => {
    if (!socket) return;
  
    const handleGroupCreated = (data) => {
      setIsModalGroupVisible(false);
      console.log("group_created data:", data);
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

        console.log(conversation.group_name + "Group name");
        
        return [
          {
            conversation_id: conversation.conversation_id,
            name: conversation.name,
            avatar: conversation.avatar,
            created_by: conversation.created_by,
            list_user_id: membersWithPermissions,
            unread_count: 1,
            is_unread: false,
            type: "group"
          },
          ...prevChats,
        ];
      });
    };
  
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
             type: "group"
          },
          ...prevChats,
        ];
      });
    };

    
  
    const handleRemovedMember =  async(data) => {
     
      const userToAdd = data.user_id;

const profile = await getProfile(userToAdd); // chờ lấy profile
if (profile) {
  sendMessage(null,true,`${userProfile?.fullname} đã bị xóa khỏi nhóm`);
}
      // Nếu user hiện tại bị xóa, xử lý nhanh và kết thúc hàm
      if (data.user_id === user.id) {
        // Xóa conversation khỏi danh sách chat và đóng các modal liên quan
        setChats(prev => prev.filter(chat => chat.conversation_id !== data.conversation_id));
        setSelectedChat(null);
        setIsInfoGroupVisible(false);
        return; // Kết thúc hàm sớm
      }
      
      // Nếu không có chat được chọn hoặc không phải conversation hiện tại
      if (!selectedChat || selectedChat.conversation_id !== data.conversation_id) {
        fetchConversations(); // Lấy lại danh sách hội thoại mà không xử lý cập nhật UI
        return;
      }
            
      // sendMessage(null,true,data.message);


      // Cập nhật danh sách chat và chat được chọn một cách hiệu quả
      const userId = data.user_id;
      setChats(prev => 
        prev.map(chat => {
          if (chat.conversation_id === data.conversation_id) {
            return {
              ...chat,
              list_user_id: chat.list_user_id.filter(member => member.user_id !== userId),
              unread_count: 1
            };
          }
          return chat;
        })
      );
      
      // Cập nhật selected chat nếu đang hiển thị
      setSelectedChat(prev => ({
        ...prev,
        list_user_id: prev.list_user_id?.filter(member => member.user_id !== userId)
      }));
    };
  
    const handleOutGroupMember = (data) => {
      // Kiểm tra nhanh nếu không phải conversation hiện tại
      if (!selectedChat || selectedChat.conversation_id !== data.conversation_id) {
        fetchConversations();
        return;
      }     
      // Lưu user_id vào biến để tránh truy cập lặp lại
      const userId = data.user_id;

      
      
      // Cập nhật danh sách chat hiệu quả
      setChats(prev => 
        prev.map(chat => {
          if (chat.conversation_id === data.conversation_id) {
            return {
              ...chat,
              list_user_id: chat.list_user_id.filter(member => member.user_id !== userId),
              unread_count: 1
            };
          }
          return chat;
        })
      );
  
      // Cập nhật selected chat
      setSelectedChat(prev => ({
        ...prev,
        list_user_id: prev.list_user_id?.filter(member => member.user_id !== userId)
      }));
    };
    const handleAddMember = async (data) => {
     
      const userToAdd = data.user_id;

const profile = await getProfile(userToAdd); // chờ lấy profile
if (profile) {
  sendMessage(null, true, `${profile.fullname} đã được thêm vào nhóm`);
}

      if (selectedChat === null || selectedChat.conversation_id !== data.conversation_id) {
        fetchConversations();
        return;
      }
  
      setSelectedChat((prev) => {
        const isAlreadyMember = prev.list_user_id.some(
          (member) => member.user_id === data.user_id
        );
        if (isAlreadyMember) return prev;

        console.log("data.user_id", data.user_id);

        const updatedList = [
          ...prev.list_user_id,
          {
            user_id: data.user_id,
            permission: data.permission || "member",
          },
        ];
        
  
        return {
          ...prev,
          list_user_id: updatedList,
        };
      });

    
    };
  
    const handleGroupRemoved = (data) => {
      if (selectedChat === null || selectedChat.conversation_id !== data.conversation_id) {
        fetchConversations();
        return;
      }

      setChats((prev) =>
        prev.filter((chat) => String(chat.conversation_id) !== String(data.conversation_id))
      );
      setSelectedChat(null);
      setIsInfoGroupVisible(false);
      setIsGroupSettingsVisible(false);
    };
  
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
    
  
    const handleOutGroup = async (data) => {
      if (selectedChat === null || selectedChat.conversation_id !== data.conversation_id) {
        fetchConversations();
        return;
      }
      const userToAdd = data.user_id;

      const profile = await getProfile(userToAdd); // chờ lấy profile
      if (profile) {
        sendMessage(null,true,`${userProfile?.fullname} đã rời nhóm`);
      }
      
    
  
      setChats((prev) =>
        prev.filter((chat) => String(chat.conversation_id) !== String(data.conversation_id))
      );
      setIsInfoGroupVisible(false);
      setSelectedChat(null);
    };
    const handleRemoveMember = async (data) => {
      const userToAdd = data.user_id;
      const profile = await getProfile(userToAdd); // Chờ lấy profile
    
      if (profile) {
        sendMessage(null, true, `${profile.fullname} đã bị xóa khỏi nhóm`);
      }
    
      setSelectedChat((prev) => ({
        ...prev,
        list_user_id: prev.list_user_id.filter(
          (member) => member.user_id !== data.user_id
        ),
      }));
    };
    // === Đăng ký ===
    socket.on("group_created", handleGroupCreated);
    socket.on("new_group", handleNewGroup);
    socket.on("user_left_group", handleOutGroupMember);
    socket.on("removed_member", handleRemovedMember);
    socket.on("add_member", handleAddMember);
    socket.on("group_deleted", handleGroupRemoved);
    socket.on("delete_group", handleGroupRemoved);
    socket.on("update_permissions", handleUpdatePermissions);
    socket.on("out_group", handleOutGroup);
    socket.on("remove_member", handleRemoveMember);

    socket.on("connect", () => {
      console.log("🔌 Socket reconnected, re-registering listeners...");
      socket.on("group_created", handleGroupCreated);
      socket.on("new_group", handleNewGroup);
      socket.on("user_left_group", handleOutGroupMember);
      socket.on("removed_member", handleRemovedMember);
      socket.on("add_member", handleAddMember);
      socket.on("group_deleted", handleGroupRemoved);
      socket.on("delete_group", handleGroupRemoved);
      socket.on("update_permissions", handleUpdatePermissions);
      socket.on("out_group", handleOutGroup);
      socket.on("remove_member", handleRemoveMember);

    });
  
    return () => {
      socket.off("group_created", handleGroupCreated);
      socket.off("new_group", handleNewGroup);
      socket.off("user_left_group", handleOutGroupMember);
      socket.off("removed_member", handleRemovedMember);
      socket.off("add_member", handleAddMember);
      socket.off("group_deleted", handleGroupRemoved);
      socket.off("delete_group", handleGroupRemoved);
      socket.off("update_permissions", handleUpdatePermissions);
      socket.off("out_group", handleOutGroup);
      socket.off("remove_member", handleRemoveMember);

      socket.off("connect");
    };
  }, [socket, selectedChat]);
  
  
  return isLoading ? (
    <div className="flex h-screen w-full bg-gray-100">
      <Spin
        size="large"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  ) : (
    <div className="flex h-screen w-full bg-gray-100">
      <ChatSidebar chats={chats} openChat={openChat} setIsModalGroupVisible={setIsModalGroupVisible} isModalGroupVisible={isModalGroupVisible}/>
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
