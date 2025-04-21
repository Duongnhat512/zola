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
  const openChat = (chat) => {
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
    socket.emit("get_conversations", { user_id: user.id });
    socket.on("conversations", (response) => {
      if (response.status === "success") {
        console.log("response.conversations", response.conversations);
        
        setChats(response.conversations);
      } else {
        console.error("Lỗi khi lấy danh sách hội thoại:", response.message);
      }
    });
    return () => {
      socket.off("conversations");
    };
  };
  useEffect(() => {
    setIsLoading(true);
    fetchConversations();
    setIsLoading(false);
  }, []);
  useEffect(() => {
  if (!socket) return; // Bảo vệ khi socket chưa khởi tạo

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
    

    setChats((prevChats) => [
      {
        conversation_id: conversation.conversation_id,
        name: conversation.name,
        avatar: conversation.avatar,
        list_user_id: membersWithPermissions,
        unread_count: 0,
        is_unread: false,
      },
      ...prevChats,
    ]);
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

    setChats((prevChats) => [
      {
        conversation_id: data.conversation_id,
        name: data.group_name,
        avatar: data.group_avatar,
        created_by: data.created_by,
        list_user_id: membersWithPermissions,
        unread_count: 0,
        is_unread: false,
      },
      ...prevChats,
    ]);
  };

  const handleRemovedMember = (data) => {
    console.log(data); // Log dữ liệu để kiểm tra
    
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

    if (selectedChat?.conversation_id === data.conversation_id) {
      setSelectedChat((prev) => {
        const isAlreadyMember = prev.list_user_id.some(
          (member) => member.user_id === data.user_id
        );

        if (isAlreadyMember) return prev;

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
    }
  };

  const handleGroupRemoved = (data) => {
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

  const handleUpdatePermissions = (data) => {
    if (selectedChat === null) return;

    console.log("Data permission: " + data.permissions);

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
  }

  // === Đăng ký ===
  socket.on("group_created", handleGroupCreated);
  socket.on("new_group", handleNewGroup);
  socket.on("user_left_group", handleRemovedMember);
  socket.on("error", handleError);
  socket.on("add_member", handleAddMember);
  socket.on("group_deleted", handleGroupRemoved);
  socket.on("delete_group", handleGroupRemoved);
  socket.on("update_permissions", handleUpdatePermissions);
  socket.on("out_group", handleOutGroup);

  // === Khi reconnect, đăng ký lại ===
  socket.on("connect", () => {
    console.log("🔌 Socket reconnected, re-registering listeners...");
    socket.on("group_created", handleGroupCreated);
    socket.on("new_group", handleNewGroup);
    socket.on("user_left_group", handleRemovedMember);
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
    socket.off("user_left_group", handleRemovedMember);
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
      />
      {isInfoGroupVisible && (
        <InfoGroup
          selectedChat={selectedChat}
          onClose={() => setIsInfoGroupVisible(false)}
          isGroupSettingsVisible={IsGroupSettingsVisible}
          setIsGroupSettingsVisible={setIsGroupSettingsVisible}
        />
      )}
    </div>
  );
};

export default HomeDetails;
