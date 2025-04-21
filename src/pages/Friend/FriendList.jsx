import React, { useState, useEffect } from "react";
import { Input, Avatar, List, Divider, Select, Button, Menu, Dropdown, message } from "antd";
import { MoreOutlined, UserOutlined } from "@ant-design/icons";
import { deleteFriend, getListFriend } from "../../services/FriendService";
import { useDispatch, useSelector } from "react-redux";
import { getUserById } from "../../services/UserService";
import { setLoading } from "../../redux/UserSlice";
import { getPrivateConversation } from "../../services/Conversation";
import ChatWindow from "../../components/ChatApp/ChatWindow";
import InfoFriend from "../../components/ChatApp/InfoFriend";

const FriendList = () => {
  const [friends, setFriends] = useState([]);
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
  

  const handleBack = () => {
    setOpenModalFriend(false);
  }

  const fetchConversations = () => {
     
     
  }

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await getListFriend(user.id);
        console.log(response);
        
        if (response.code === 200 && Array.isArray(response.data)) {
          const detailedUsers = await Promise.all(
            response.data.map(async (request) => {
              try {
                const userDetail = await getUserById(request.user_friend_id);
                console.log(userDetail);

                return userDetail?.user || null; // Ensure safe access to data
              } catch (error) {
                console.error(
                  "Error fetching user details for received invitations:",
                  error
                );
                return null;
              }
            })
          );
          setFriends(
            detailedUsers.filter((user) => user !== null) // Filter out null values
          );
        }
      } catch (error) {
        console.error("Error fetching friend list:", error);
      }
    };

    fetchFriends();
  }, [user.id]);

  const filteredFriends = friends
    .filter((friend) =>
      friend.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "A-Z") {
        return a.name?.localeCompare(b.name || "");
      } else {
        return b.name?.localeCompare(a.name || "");
      }
    });

  const groupedFriends = filteredFriends.reduce((acc, friend) => {
    const firstLetter = friend.fullname.charAt(0).toUpperCase();
    console.log(firstLetter);

    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(friend);
    return acc;
  }, {});

  const handleFindConversation = async (userId, friendId) => {
    try {
      const response = await getPrivateConversation(userId, friendId);
      console.log("Private conversation response:", response);
      if (response.status === "success") {
        // Handle successful conversation retrieval
        if (response.newConversation) {
          console.log("newConversation  : "+ response.newConversation);

          setSelectedChat({
            conversation_id: response.newConversation.id,
            list_user_id: response.newConversation.members,
            list_message: [],
            avatar: response.newConversation.avatar,
            name: response.newConversation.name,
            created_by: response.newConversation.created_by,
            unread_count: 0,
            is_unread: false,
          });
          setChats((prevChats) =>
            prevChats.map((c) =>
              c.conversation_id === response.conversation.conversation_id
                ? { ...c, unread_count: 0 }
                : c
            )
          );
        } else {
          console.log("Conversation : "+ response.conversation);
          
          setSelectedChat(response.conversation);

          setChats((prevChats) =>
            prevChats.map((c) =>
              c.conversation_id === response.conversation.conversation_id
                ? { ...c, unread_count: 0 }
                : c
            )
          );
        }
        fetchUserDetails(response.conversation, friendId); // Fetch user details for the conversation
      } else {
        console.error("Error fetching conversation:", response.message);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };
  const fetchUserDetails = async (chat, friendId) => {
    console.log("Fetching user details...", chat);

    // if (!chat || !chat.list_user_id) {
    //   chat = {
    //     list_user_id: [friendId],
    //     list_message: [],
    //   };
    // }

    try {
      const updatedChats = await Promise.all(
        chat.list_user_id.map(async (userId) => {
          console.log("Fetching user details for userId:", userId);
          try {
            const response = await getUserById(userId);
            if (response.status === "success") {
              return {
                ...chat,
                user: response.user,
              };
            } else {
              console.error(
                "Không lấy được thông tin người dùng:",
                response.message
              );
              return {
                ...chat,
                user: null,
              };
            }
          } catch (error) {
            console.error("Lỗi khi gọi API lấy user:", error);
            return {
              ...chat,
              user: null,
            };
          }
        })
      );

      console.log("Updated Chats:", updatedChats);

      // Nếu bạn chỉ cần 1 user (ví dụ người còn lại trong cuộc trò chuyện), dùng cái đầu tiên
      setSelectedChat(updatedChats[0]);
    } catch (error) {
      console.error("Lỗi khi xử lý danh sách chats:", error);
    }
  };
  const handleViewInfo = (friend) => {
    setUserInfo(friend);
    setOpenModalFriend(true); // nếu bạn đang dùng modal
  };
  
  const handleRemoveFriend = async (friend) => {
  try {
    const response = await deleteFriend(user.id, friend.id);
    console.log('Xóa bạn:', response);

    if (response.code === 200) {
      message.success('Đã xóa bạn thành công');

      // Cập nhật lại danh sách bạn bè sau khi xóa
      setFriends((prevFriends) =>
        prevFriends.filter((f) => f.id !== friend.id)
      );
    } else {
      message.error('Xóa bạn không thành công');
    }
  } catch (error) {
    console.error('Lỗi khi xóa bạn:', error);
    message.error('Đã xảy ra lỗi khi xóa bạn');
  }
  };
  
  return (
    <div className="flex h-screen">
      {/* Main Content */}
      {selectedChat === null ? (
        <div className="flex-1 bg-white p-6">
          <h1 className="text-xl font-semibold mb-4">Danh sách bạn bè</h1>
          <div className="flex justify-between items-center mb-4">
            <span>Bạn bè ({friends.length})</span>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm bạn"
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

          {Object.keys(groupedFriends).map((letter) => (
            <div key={letter}>
              <Divider orientation="left">{letter}</Divider>
              <List
  dataSource={groupedFriends[letter]}
  renderItem={(friend) => {
    const menu = (
      <Menu>
        <Menu.Item key="info" onClick={() => handleViewInfo(friend)}>
          Xem thông tin
        </Menu.Item>
        <Menu.Item key="remove" onClick={() => handleRemoveFriend(friend)}>
          Xóa bạn
        </Menu.Item>
      </Menu>
    );

    return (
      <List.Item className="flex items-center gap-4 justify-between">
        <div
          onClick={() => handleFindConversation(user.id, friend.id)}
          className="flex flex-1 items-center gap-2 hover:bg-gray-100 p-2 rounded cursor-pointer"
        >
          <Avatar size={40} icon={<UserOutlined />} src={friend.avt} />
          <span>{friend.fullname}</span>
        </div>

        <Dropdown overlay={menu} trigger={['click']}>
          <MoreOutlined className="text-xl cursor-pointer hover:text-gray-600" />
        </Dropdown>
      </List.Item>
    );
  }}
/>
            </div>
          ))}
        </div>
      ) : (
        <ChatWindow
          selectedChat={selectedChat}
          messages={messages}
          input={input}
          setMessages={setMessages}
          setInput={setInput}
          setChats={setChats}
          fetchConversations={fetchConversations}
          
        />
      )}
      {openModalFriend && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-2 rounded-2xl shadow-lg max-w-md w-full">
          <InfoFriend
            userInfo={userInfo}
            handleBack={handleBack}
            step={step}
            

          />
        </div>
      </div>
    )}
    </div>
  );
};

export default FriendList;
