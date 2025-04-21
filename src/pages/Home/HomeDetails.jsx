import React, { useEffect, useState } from "react";
import ChatSidebar from "../../components/ChatApp/ChatSidebar";
import ChatWindow from "../../components/ChatApp/ChatWindow";
import socket from "../../services/Socket";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import "react-toastify/dist/ReactToastify.css"; // Import CSS cho Toastify
import { toast } from "react-toastify"; // Import react-toastify
import InfoGroup from "../Group/InfoGroup";
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
  
      toast.success(`Nhóm ${conversation.conversation_id} đã được tạo thành công!`, {
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
  
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
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
  
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
  
    const handleRemovedMember = (data) => {
      // Nếu user hiện tại bị xóa, xử lý nhanh và kết thúc hàm
      if (data.user_id === user.id) {
        toast.info("Bạn bị xóa khỏi nhóm này", {
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        
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
      
      // Thông báo khi người khác bị xóa khỏi nhóm
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      
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
  
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      
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
  
    const handleError = (data) => {
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    };
  
    const handleAddMember = (data) => {
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });

      console.log(data.conversation_id + "Conversation");
      
  
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
  
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
  
      setChats((prev) =>
        prev.filter((chat) => String(chat.conversation_id) !== String(data.conversation_id))
      );
      setSelectedChat(null);
      setIsInfoGroupVisible(false);
      setIsGroupSettingsVisible(false);
    };
  
    const handleUpdatePermissions = (data) => {
      if (selectedChat === null || selectedChat.conversation_id !== data.conversation_id) {
        fetchConversations();
        return;
      }
  
      setSelectedChat((prev) => {
        const updatedList = prev.list_user_id?.map((member) => {
          if (member.user_id === data.user_id) {
            return { ...member, permission: data.permissions };
          }
          return member;
        });
  
        return {
          ...prev,
          list_user_id: updatedList,
        };
      });
  
      setIsGroupSettingsVisible(false);
      setInfoPermissions((prev) => ({
        ...prev,
        message: data.message,
      }));
    };
  
    const handleOutGroup = (data) => {
      if (selectedChat === null || selectedChat.conversation_id !== data.conversation_id) {
        fetchConversations();
        return;
      }
  
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
  
      setChats((prev) =>
        prev.filter((chat) => String(chat.conversation_id) !== String(data.conversation_id))
      );
      setIsInfoGroupVisible(false);
      setSelectedChat(null);
    };
  
    // === Đăng ký ===
    socket.on("group_created", handleGroupCreated);
    socket.on("new_group", handleNewGroup);
    socket.on("user_left_group", handleOutGroupMember);
    socket.on("removed_member", handleRemovedMember);
    socket.on("error", handleError);
    socket.on("add_member", handleAddMember);
    socket.on("group_deleted", handleGroupRemoved);
    socket.on("delete_group", handleGroupRemoved);
    socket.on("update_permissions", handleUpdatePermissions);
    socket.on("out_group", handleOutGroup);
  
    socket.on("connect", () => {
      console.log("🔌 Socket reconnected, re-registering listeners...");
      socket.on("group_created", handleGroupCreated);
      socket.on("new_group", handleNewGroup);
      socket.on("user_left_group", handleOutGroupMember);
      socket.on("removed_member", handleRemovedMember);
      socket.on("error", handleError);
      socket.on("add_member", handleAddMember);
      socket.on("group_deleted", handleGroupRemoved);
      socket.on("delete_group", handleGroupRemoved);
      socket.on("update_permissions", handleUpdatePermissions);
      socket.on("out_group", handleOutGroup);
    });
  
    return () => {
      socket.off("group_created", handleGroupCreated);
      socket.off("new_group", handleNewGroup);
      socket.off("user_left_group", handleOutGroupMember);
      socket.off("removed_member", handleRemovedMember);
      socket.off("error", handleError);
      socket.off("add_member", handleAddMember);
      socket.off("group_deleted", handleGroupRemoved);
      socket.off("delete_group", handleGroupRemoved);
      socket.off("update_permissions", handleUpdatePermissions);
      socket.off("out_group", handleOutGroup);
      socket.off("connect");
    };
  }, [socket, selectedChat]);
  

  useEffect(() => {
    socket.on("remove_member", (data) => {
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
        setSelectedChat((prev) => ({
          ...prev,
          list_user_id: prev.list_user_id.filter(
            (member) => member.user_id !== data.user_id
          ),
        }));
        
    });
  
    // Cleanup listener để tránh đăng ký nhiều lần
    return () => {
      socket.off("remove_member");
    };
  }, [socket, selectedChat?.conversation_id]);
  
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
        
      />
      {isInfoGroupVisible && (
        <InfoGroup
          selectedChat={selectedChat}
          onClose={() => setIsInfoGroupVisible(false)}
          isGroupSettingsVisible={IsGroupSettingsVisible}
          setIsGroupSettingsVisible={setIsGroupSettingsVisible}
          setIsModalAddMemberVisible={setIsModalAddMemberVisible}

        />
      )}
    </div>
  );
};

export default HomeDetails;
