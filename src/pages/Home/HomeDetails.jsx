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
        console.log("Conversations:", response.conversations);
        
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
    
      setChats((prevChats) => [
        {
          conversation_id: conversation.conversation_id,
          name: conversation.name,
          avatar: conversation.avatar,
          members: conversation.members ?? [],
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
      setChats((prevChats) => {
        return [
          {
            conversation_id: data.conversation_id,
            name: data.group_name,
            avatar: data.group_avatar,
            created_by: data.created_by,
            members: data.members,
            unread_count: 0,
            is_unread: false
          },
          ...prevChats
        ];
      });
      
    };
  
    const handleRemovedMember = (data) => {
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      //
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
              permission: data.permission || "member", // mặc định là member nếu không có
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
      console.log(data);
      
      toast.info(data.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });

      setSelectedChat((prev) => {
        const updatedList = prev.list_user_id.map((member) => {
          if (data.permissions==="owner" && member.permission === "owner") {
            return { ...member, permission: "member" };
          }
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
    }
    
    // Đăng ký sự kiện
    socket.on("group_created", handleGroupCreated);
    socket.on("new_group", handleNewGroup);
    socket.on("removed_member", handleRemovedMember);
    socket.on("error", handleError);
    socket.on("add_member", handleAddMember);
    socket.on("group_deleted", handleGroupRemoved);
    socket.on("delete_group", handleGroupRemoved);
    socket.on("update_permissions", handleUpdatePermissions);

    // Cleanup
    return () => {
      socket.off("group_created", handleGroupCreated);
      socket.off("new_group", handleNewGroup);
      socket.off("removed_member", handleRemovedMember);
      socket.off("error", handleError);
      socket.off("add_member", handleAddMember);
      socket.off("delete_group", handleGroupRemoved);

    };
  }, [socket]);
  

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
